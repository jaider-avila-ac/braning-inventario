import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from "../../utils/notifications";
import { obtenerFactura, crearFactura, actualizarFactura } from "../../services/facturas.service";
import {
  emitirFactura as emitirAction,
  anularFactura as anularAction,
} from "./actions/index";

const getTodayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const makeLinea = () => ({
  id: crypto.randomUUID(),
  item_id: null,
  descripcion: "",
  cantidad: 1,
  valor_unitario: 0,
  descuento: 0,
  iva_pct: 19,
});

export function useFacturaLibreForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== "nueva-libre";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState(() => ({
    cliente: null,
    fecha: getTodayISO(),
    notas: "",
    modoIva: "global",
    ivaGlobal: 19,
    lineas: [makeLinea()],
  }));
  const [facturaId, setFacturaId] = useState(null);
  const [numero, setNumero] = useState(null);
  const [estado, setEstado] = useState(null);

  const totales = useMemo(() =>
    formData.lineas.reduce((acc, l) => {
      const base = l.cantidad * l.valor_unitario;
      const desc = l.descuento || 0;
      const neta = base - desc;
      const pct = formData.modoIva === "global" ? formData.ivaGlobal : (l.iva_pct || 0);
      acc.subtotal += base;
      acc.descuentos += desc;
      acc.iva += neta * (pct / 100);
      acc.total = acc.subtotal - acc.descuentos + acc.iva;
      return acc;
    }, { subtotal: 0, descuentos: 0, iva: 0, total: 0 }),
  [formData.lineas, formData.modoIva, formData.ivaGlobal]);

  const loadFactura = useCallback(async () => {
    if (!isEditing) return;
    setLoading(true);
    try {
      const data = await obtenerFactura(id);
      setFacturaId(data.id);
      setNumero(data.numero);
      setEstado(data.estado);

      const lineasData = (data.lineas || []).map(l => ({
        id: l.id || crypto.randomUUID(),
        item_id: l.item_id,
        descripcion: l.descripcion_manual || l.item?.nombre || "",
        cantidad: parseFloat(l.cantidad) || 1,
        valor_unitario: parseFloat(l.valor_unitario) || 0,
        descuento: parseFloat(l.descuento) || 0,
        iva_pct: parseFloat(l.iva_pct) || 19,
      }));

      const ivasPct = [...new Set(lineasData.map(l => String(l.iva_pct)))];
      const modoIva = ivasPct.length === 1 && ivasPct[0] !== "0" ? "global" : "linea";
      const ivaGlobal = modoIva === "global" ? Number(ivasPct[0]) : 19;

      setFormData({
        cliente: data.cliente || null,
        fecha: data.fecha?.substring(0, 10) || getTodayISO(),
        notas: data.notas || "",
        modoIva,
        ivaGlobal,
        lineas: lineasData,
      });
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (isEditing) {
      loadFactura();
    }
  }, [isEditing, loadFactura]);

  const guardar = async () => {
    setSubmitted(true);
    if (!formData.cliente?.id) {
      showToast("Selecciona un cliente", "error");
      return;
    }
    if (formData.lineas.length === 0) {
      showToast("Agrega al menos una línea", "error");
      return;
    }
    for (let i = 0; i < formData.lineas.length; i++) {
      if (!formData.lineas[i].descripcion?.trim()) {
        showToast(`Línea ${i + 1}: la descripción es obligatoria`, "error");
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        tipo: "LIBRE",
        cliente_id: formData.cliente.id,
        fecha: formData.fecha,
        notas: formData.notas || null,
        lineas: formData.lineas.map(l => ({
          item_id: null,
          descripcion_manual: l.descripcion || null,
          cantidad: l.cantidad,
          valor_unitario: l.valor_unitario,
          descuento: l.descuento,
          iva_pct: formData.modoIva === "global" ? formData.ivaGlobal : l.iva_pct,
        })),
      };
      if (isEditing && facturaId) {
        await actualizarFactura(facturaId, payload);
        showToast("Factura actualizada", "success");
        await loadFactura();
      } else {
        const result = await crearFactura(payload);
        showToast("Factura libre creada", "success");
        navigate(`/facturas/editar-libre/${result.id}`);
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const emitir = async () => {
    if (!facturaId) { showToast("Primero guarda la factura", "warning"); return; }
    await emitirAction(facturaId, loadFactura);
  };

  const anular = async () => {
    if (!facturaId) return;
    await anularAction(facturaId, loadFactura);
  };

  const updateCliente = (cliente) => setFormData(prev => ({ ...prev, cliente }));
  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const addLinea = () => setFormData(prev => ({
    ...prev,
    lineas: [...prev.lineas, makeLinea()],
  }));

  const updateLinea = (index, field, value) => setFormData(prev => ({
    ...prev,
    lineas: prev.lineas.map((l, i) => i === index ? { ...l, [field]: value } : l),
  }));

  const removeLinea = (index) => setFormData(prev => ({
    ...prev,
    lineas: prev.lineas.filter((_, i) => i !== index),
  }));

  const isEditable = !estado || estado === "BORRADOR";

  return {
    loading, saving, submitted, formData, totales,
    facturaId, numero, estado, isEditing, isEditable,
    guardar, emitir, anular,
    updateCliente, updateField, addLinea, updateLinea, removeLinea,
  };
}

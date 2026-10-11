import { useState, useEffect } from "react";
import { registrarVentaRapida, getVentasRapidas, anularVentaRapida } from "../../services/ventaRapida.service";
import { showToast } from "../../utils/notifications";

const getTodayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function useVentaRapida() {
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [formaPago, setFormaPago] = useState("");
  const [referencia, setReferencia] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [fecha, setFecha] = useState(getTodayISO());
  const [kpis, setKpis] = useState({ total: 0, count: 0 });

  const setItemFromSearch = (item) => {
    setItemSeleccionado(item);
    setValorUnitario(item.precio_venta_sugerido?.toString() || "");
    setCantidad("");
  };

  const clearItem = () => {
    setItemSeleccionado(null);
    setCantidad("");
    setValorUnitario("");
  };

  // Efecto con .then/.catch/.finally — setState solo en callbacks de promesa
  useEffect(() => {
    let cancelled = false;
    getVentasRapidas({ desde: fecha, hasta: fecha })
      .then(rows => {
        if (cancelled) return;
        setHistorial(rows);
        const t = rows.reduce((sum, r) => sum + (parseFloat(r.total_pagado) || 0), 0);
        setKpis({ total: t, count: rows.length });
      })
      .catch(err => {
        if (!cancelled) {
          console.error("Error cargando historial:", err);
          showToast(err.message, "error");
          setHistorial([]);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fecha]);

  // Solo desde handleRegistrar (event handler — sin restricción de linter)
  const loadHistorial = async () => {
    setLoading(true);
    try {
      const rows = await getVentasRapidas({ desde: fecha, hasta: fecha });
      setHistorial(rows);
      const t = rows.reduce((sum, r) => sum + (parseFloat(r.total_pagado) || 0), 0);
      setKpis({ total: t, count: rows.length });
    } catch (err) {
      console.error("Error cargando historial:", err);
      showToast(err.message, "error");
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = async (id) => {
    try {
      await anularVentaRapida(id);
      showToast("Venta anulada correctamente", "success");
      await loadHistorial();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const canSubmit = itemSeleccionado &&
    (parseFloat(cantidad) || 0) > 0 &&
    (parseFloat(valorUnitario) || 0) >= 0 &&
    formaPago !== "";

  const total = (parseFloat(cantidad) || 0) * (parseFloat(valorUnitario) || 0);

  const handleRegistrar = async (onClearItem) => {
    if (!canSubmit) return;

    const cant = parseFloat(cantidad);
    const vUnit = parseFloat(valorUnitario);

    if (itemSeleccionado.controla_inventario) {
      const disponible = itemSeleccionado.cantidad_actual || 0;
      if (cant > disponible) {
        showToast(`Stock insuficiente. Disponible: ${disponible}`, "error");
        return;
      }
    }

    setRegistrando(true);
    try {
      await registrarVentaRapida({
        item_id: itemSeleccionado.id,
        cantidad: cant,
        valor_unitario: vUnit,
        forma_pago: formaPago,
        referencia: referencia || null,
      });
      showToast("Venta registrada correctamente", "success");
      clearItem();
      if (onClearItem) onClearItem();
      setFormaPago("");
      setReferencia("");
      await loadHistorial();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRegistrando(false);
    }
  };

  return {
    itemSeleccionado,
    setItemFromSearch,
    clearItem,
    cantidad,
    setCantidad,
    valorUnitario,
    setValorUnitario,
    formaPago,
    setFormaPago,
    referencia,
    setReferencia,
    historial,
    loading,
    registrando,
    kpis,
    fecha,
    setFecha,
    total,
    canSubmit,
    handleRegistrar,
    handleAnular,
  };
}

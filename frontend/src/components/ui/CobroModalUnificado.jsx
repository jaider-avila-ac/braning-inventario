import { useState, useEffect } from "react";
import { X, DollarSign, History } from "lucide-react";
import { obtenerPagos, registrarPago, obtenerCreditoCliente } from "../../services/pagos.service";
import { showToast } from "../../utils/notifications";
import DataTable from "./DataTable";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

// Handles both raw numbers and formatted currency strings
const extractNum = (v) => typeof v === "number" ? v : parseFloat(v) || 0;

const getTodayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const buildInitialState = (factura) => ({
  formData: {
    factura_id: factura?.id ?? null,
    cliente_id: factura?.cliente_id ?? null,
    fecha: getTodayISO(),
    forma_pago: "EFECTIVO",
    monto: "",
    referencia: "",
    notas: "",
  },
  saldoFactura: extractNum(factura?.saldo_raw ?? factura?.saldo),
  msg: { text: "", type: "" },
});

export default function CobroModalUnificado({ isOpen, onClose, onPagoOk, factura }) {
  const [loading, setLoading] = useState(false);
  const [pagos, setPagos] = useState([]);
  const [creditoDisponible, setCreditoDisponible] = useState(0);
  // Prop initializer: correcto porque el padre usa key={factura.id} para remontar
  const [modalState, setModalState] = useState(() => buildInitialState(factura));

  const { formData, saldoFactura, msg } = modalState;

  const formasPago = [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "TARJETA", label: "Tarjeta" },
    { value: "BILLETERA", label: "Billetera" },
    { value: "OTRO", label: "Otro" },
  ];

  const pagosColumns = [
    { key: "numero_recibo", label: "Recibo" },
    { key: "fecha", label: "Fecha" },
    { key: "forma_pago", label: "Forma" },
    { key: "registrado_por", label: "Registrado por" },
    { key: "monto", label: "Monto", align: "right" },
  ];

  const nombreUsuario = (u) => {
    if (!u) return null;
    return u.nombre_completo || [u.nombres, u.apellidos].filter(Boolean).join(" ").trim() || null;
  };

  const pagosData = pagos.map(p => {
    const registrador = nombreUsuario(p.usuario);
    return {
      numero_recibo: <span className="font-semibold text-gray-800">{p.numero_recibo || "—"}</span>,
      fecha: p.fecha || "—",
      forma_pago: p.forma_pago || "—",
      registrado_por: registrador
        ? <span className="text-xs text-gray-500">{registrador}</span>
        : <span className="text-xs text-gray-300">—</span>,
      monto: <span className="text-green-600 font-semibold">{formatMoney(p.monto)}</span>,
    };
  });

  const cargarHistorialPagos = async (facturaId) => {
    try {
      const data = await obtenerPagos(facturaId);
      setPagos(data);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      setPagos([]);
    }
  };

  const cargarCreditoCliente = async (clienteId) => {
    try {
      const credito = await obtenerCreditoCliente(clienteId);
      setCreditoDisponible(credito);
    } catch (error) {
      console.error("Error cargando crédito:", error);
      setCreditoDisponible(0);
    }
  };

  // setState dentro de callbacks .then() — patrón aceptado por la regla react-compiler
  useEffect(() => {
    if (!isOpen || !factura) return;
    obtenerPagos(factura.id)
      .then(data => setPagos(data))
      .catch(() => setPagos([]));
    obtenerCreditoCliente(factura.cliente_id)
      .then(credito => setCreditoDisponible(credito))
      .catch(() => setCreditoDisponible(0));
  }, [isOpen, factura]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setModalState(prev => ({ ...prev, formData: { ...prev.formData, [id]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const montoNum = parseFloat(formData.monto) || 0;

    if (!formData.fecha) {
      setModalState(prev => ({ ...prev, msg: { text: "La fecha es obligatoria", type: "error" } }));
      return;
    }
    if (montoNum <= 0) {
      setModalState(prev => ({ ...prev, msg: { text: "El monto debe ser mayor a 0", type: "error" } }));
      return;
    }

    setLoading(true);
    setModalState(prev => ({ ...prev, msg: { text: "", type: "" } }));

    try {
      const payload = {
        factura_id: parseInt(formData.factura_id),
        fecha: formData.fecha,
        forma_pago: formData.forma_pago,
        monto: montoNum,
        referencia: formData.referencia || null,
        notas: formData.notas || null,
      };

      const data = await registrarPago(payload);

      let successMsg = "Pago registrado correctamente.";
      if (data?.saldo_favor_consumido > 0) {
        successMsg += ` Crédito aplicado: ${formatMoney(data.saldo_favor_consumido)}.`;
      }
      if (data?.exceso_nuevo_favor > 0) {
        successMsg += ` Nuevo crédito a favor: ${formatMoney(data.nuevo_saldo_favor)}.`;
      }

      const nuevoSaldo = saldoFactura - montoNum;
      setModalState(prev => ({
        ...prev,
        saldoFactura: nuevoSaldo,
        formData: { ...prev.formData, monto: "" },
        msg: { text: successMsg, type: "success" },
      }));

      showToast(successMsg, "success");
      await cargarHistorialPagos(formData.factura_id);
      await cargarCreditoCliente(formData.cliente_id);
      if (onPagoOk) await onPagoOk(data, factura);

      setTimeout(() => {
        if (nuevoSaldo <= 0) onClose();
      }, 1500);

    } catch (error) {
      const errMsg = error?.message || "Error al registrar pago";
      setModalState(prev => ({ ...prev, msg: { text: errMsg, type: "error" } }));
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const montoNum = parseFloat(formData.monto) || 0;
  const isMontoValido = montoNum > 0;
  const estaPagada = saldoFactura <= 0;

  if (!isOpen || !factura) return null;

  const totalDisplay = formatMoney(extractNum(factura.total_raw ?? factura.total));
  const pagadoDisplay = formatMoney(extractNum(factura.pagado_raw ?? factura.total_pagado ?? factura.pagado));
  const saldoDisplay = formatMoney(extractNum(factura.saldo_raw ?? factura.saldo));

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1050 }}>
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>

      <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Pagos de Factura</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-500">Factura</div>
            <div className="font-semibold text-lg">{factura.numero}</div>
            <div className="flex gap-4 mt-1 text-sm flex-wrap">
              <span>Total: <strong>{totalDisplay}</strong></span>
              <span>Pagado: <strong className="text-green-600">{pagadoDisplay}</strong></span>
              <span>Saldo: <strong className="text-red-600">{saldoDisplay}</strong></span>
            </div>
          </div>

          {creditoDisponible > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <i className="bi bi-tag-fill text-green-600"></i>
              <span className="text-sm text-green-800">
                Crédito disponible: <strong>{formatMoney(creditoDisponible)}</strong>
              </span>
            </div>
          )}

          <h6 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Registrar nuevo pago
          </h6>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
                <input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Forma de pago *</label>
                <select
                  id="forma_pago"
                  value={formData.forma_pago}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {formasPago.map(fp => (
                    <option key={fp.value} value={fp.value}>{fp.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monto a pagar *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="monto"
                  type="number"
                  step="1"
                  min="1"
                  value={formData.monto}
                  onChange={handleChange}
                  disabled={estaPagada}
                  className={`w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${estaPagada ? "bg-gray-100" : ""}`}
                  placeholder="0"
                  required
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {estaPagada ? (
                  <span className="text-green-600">✓ Factura pagada completamente</span>
                ) : (
                  <span>Saldo pendiente: {formatMoney(saldoFactura)}. Si paga más, el excedente queda como crédito a favor.</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Referencia (opcional)</label>
              <input
                id="referencia"
                type="text"
                value={formData.referencia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="80"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notas (opcional)</label>
              <textarea
                id="notas"
                rows="2"
                value={formData.notas}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="255"
              />
            </div>

            {msg.text && (
              <div className={`p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {msg.text}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || estaPagada || !isMontoValido}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cash-coin"></i>
                    Registrar pago
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>

          <hr className="my-4" />
          <h6 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            Historial de pagos
          </h6>

          <DataTable
            columns={pagosColumns}
            rows={pagosData}
            empty="No hay pagos registrados"
            loading={false}
            searchKeys={[]}
            pageSize={pagosData.length}
          />
        </div>
      </div>
    </div>
  );
}

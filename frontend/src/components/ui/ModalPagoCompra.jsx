import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const getTodayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function ModalPagoCompra({ 
  isOpen, 
  onClose, 
  compra, 
  onPagar 
}) {
  const [fecha, setFecha] = useState(getTodayISO());
  const [monto, setMonto] = useState(compra?.saldo_pendiente?.toString() || "");
  const [medioPago, setMedioPago] = useState("TRANSFERENCIA");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !compra) return null;

  const saldoPendiente = compra.saldo_pendiente || 0;
  const montoNum = parseFloat(monto) || 0;
  const isMontoValido = montoNum > 0 && montoNum <= saldoPendiente;

  const handleMontoChange = (e) => {
    let valor = e.target.value;
    if (valor === "") {
      setMonto("");
      return;
    }
    let num = parseFloat(valor);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > saldoPendiente) num = saldoPendiente;
    setMonto(num.toString());
  };

  const handleSubmit = async () => {
    if (!fecha) { setError("La fecha es obligatoria"); return; }
    if (!montoNum || montoNum <= 0) { setError("El monto debe ser mayor a 0"); return; }
    if (montoNum > saldoPendiente) { setError(`El monto no puede superar el saldo pendiente (${formatMoney(saldoPendiente)})`); return; }

    setLoading(true);
    setError("");
    try {
      await onPagar(compra.id, { fecha, monto: montoNum, medio_pago: medioPago, notas });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-1050 flex items-center justify-center">
      {/* SIN OVERLAY - fondo transparente */}
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center px-5 py-3 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <h3 className="text-lg font-semibold text-white">Registrar pago</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-gray-600">Compra:</span>
              <span className="font-semibold">{compra.numero || "Nueva"}</span>
            </div>
            <div className="flex justify-between items-center flex-wrap gap-2 mt-2">
              <span className="text-gray-600">Proveedor:</span>
              <span className="font-semibold">{compra.proveedor?.nombre || "—"}</span>
            </div>
            <div className="flex justify-between items-center flex-wrap gap-2 mt-2 pt-2 border-t border-gray-200">
              <span className="text-gray-600">Saldo pendiente:</span>
              <span className="font-bold text-red-600 text-lg">{formatMoney(saldoPendiente)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Input id="fecha" label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto a pagar *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input type="number" step="100" min="1" max={saldoPendiente} value={monto} onChange={handleMontoChange} className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${montoNum > saldoPendiente ? "border-red-500" : "border-gray-300"}`} placeholder="0" required />
              </div>
              <p className="text-xs text-gray-400 mt-1">Monto máximo a pagar: {formatMoney(saldoPendiente)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medio de pago *</label>
              <select value={medioPago} onChange={(e) => setMedioPago(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
              </select>
            </div>
            
            <Input id="notas" label="Notas (opcional)" type="text" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas adicionales..." />

            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</div>}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button text={loading ? "Guardando..." : "Registrar pago"} variant="primary" onClick={handleSubmit} disabled={loading || !isMontoValido} className="flex-1" />
              <Button text="Cancelar" variant="outline" onClick={onClose} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
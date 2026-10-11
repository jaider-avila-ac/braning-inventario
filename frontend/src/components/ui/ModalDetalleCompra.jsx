import { X } from "lucide-react";
import { Button } from "./Button";
import DataTable from "./DataTable";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return iso.substring(0, 10);
};

// Columnas para la tabla de pagos - usa DataTable
const PAGOS_COLUMNS = [
  { key: "fecha", label: "Fecha", sortable: true },
  { key: "medio_pago", label: "Medio", sortable: true },
  { key: "monto", label: "Monto", align: "right", sortable: true },
  { key: "notas", label: "Notas" },
];

export function ModalDetalleCompra({ 
  isOpen, 
  onClose, 
  compra, 
  onConfirmar, 
  onPagar, 
  onAnular 
}) {
  if (!isOpen || !compra) return null;

  const saldoPendiente = compra.saldo_pendiente || 0;
  const puedePagar = (compra.estado === "PENDIENTE" || compra.estado === "PARCIAL") && saldoPendiente > 0;
  const puedeConfirmar = compra.estado === "PENDIENTE" && !compra.numero;
  const puedeAnular = compra.estado === "PENDIENTE" || compra.estado === "PARCIAL";

  // Datos para DataTable de pagos
  const pagosData = (compra.pagos || []).map(p => ({
    fecha: formatDate(p.fecha),
    medio_pago: p.medio_pago || p.forma_pago || "—",
    monto: formatMoney(p.monto),
    notas: p.notas || "—",
  }));

  return (
    <div className="fixed inset-0 z-1050 flex items-center justify-center">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-5 py-3 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <h3 className="text-lg font-semibold text-white">Compra {compra.numero || "Nueva"}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Información general */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <div className="text-xs text-gray-400">Proveedor</div>
              <div className="font-semibold text-gray-800">{compra.proveedor?.nombre || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Fecha</div>
              <div>{formatDate(compra.fecha)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Condición</div>
              <div>{compra.condicion_pago || "—"}</div>
            </div>
          </div>

          {/* Líneas de productos - tabla normal */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Productos</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Producto</th>
                    <th className="text-right px-3 py-2">Cant.</th>
                    <th className="text-right px-3 py-2">Precio</th>
                    <th className="text-right px-3 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {compra.items?.length ? compra.items.map((l, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">{l.item?.nombre || "—"}</td>
                      <td className="px-3 py-2 text-right">{l.cantidad}</td>
                      <td className="px-3 py-2 text-right">{formatMoney(l.precio_unitario)}</td>
                      <td className="px-3 py-2 text-right">{formatMoney(l.subtotal)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-400">Sin líneas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Subtotal:</span>
                <span className="float-right">{formatMoney(compra.subtotal)}</span>
              </div>
              <div>
                <span className="text-gray-500">Impuestos:</span>
                <span className="float-right">{formatMoney(compra.impuestos)}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Total:</span>
                <span className="float-right font-bold">{formatMoney(compra.total)}</span>
              </div>
              <div>
                <span className="text-gray-500">Saldo:</span>
                <span className="float-right font-bold text-red-600">{formatMoney(saldoPendiente)}</span>
              </div>
            </div>
          </div>

          {/* Pagos registrados con DataTable */}
          {compra.pagos?.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Pagos registrados</div>
              <DataTable
                columns={PAGOS_COLUMNS}
                rows={pagosData}
                loading={false}
                empty="No hay pagos registrados"
                pageSize={5}
                searchKeys={[]}
              />
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-100">
            {puedeConfirmar && (
              <Button 
                text="Confirmar compra" 
                variant="success" 
                onClick={() => { onConfirmar(compra.id); onClose(); }} 
              />
            )}
            {puedePagar && (
              <Button 
                text="Registrar pago" 
                variant="primary" 
                onClick={() => onPagar(compra)} 
              />
            )}
            {puedeAnular && (
              <Button 
                text="Anular compra" 
                variant="danger" 
                onClick={() => { onAnular(compra.id); onClose(); }} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
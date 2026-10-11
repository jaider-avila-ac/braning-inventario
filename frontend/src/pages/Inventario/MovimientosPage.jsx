import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/DataTable/Pagination";
import { useMovimientos } from "./useMovimientos";

const formatDate = (dt) => {
  if (!dt) return "—";
  return String(dt).replace("T", " ").slice(0, 19);
};

const formatNumber = (n) => {
  return Number(n || 0).toLocaleString("es-CO");
};

const TIPO_STYLES = {
  ENTRADA: "bg-green-100 text-green-700",
  SALIDA: "bg-red-100 text-red-700",
  AJUSTE: "bg-yellow-100 text-yellow-700",
};

const SUBTIPO_LABELS = {
  COMPRA_LIBRE:            "Libre",
  COMPRA_CONTADO:          "Contado",
  COMPRA_CREDITO:          "Crédito",
  RETIRO_MANUAL:           "Retiro manual",
  ANULACION_COMPRA:        "Anulación compra",
  AJUSTE_COMPRA_AUMENTO:   "Ajuste ↑ compra",
  AJUSTE_COMPRA_REDUCCION: "Ajuste ↓ compra",
};

const TipoBadge = ({ tipo }) => {
  const style = TIPO_STYLES[tipo] || "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>{tipo}</span>;
};

const SubtipoBadge = ({ subtipo }) => {
  if (!subtipo) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-mono">
      {SUBTIPO_LABELS[subtipo] ?? subtipo}
    </span>
  );
};

const COLUMNS = [
  { key: "fecha", label: "Fecha", sortable: true },
  { key: "tipo_badge", label: "Tipo", align: "center" },
  { key: "subtipo_badge", label: "Subtipo", align: "center" },
  { key: "cantidad", label: "Cantidad", align: "right", sortable: true },
  { key: "saldo", label: "Saldo", align: "right", sortable: true },
  { key: "usuario", label: "Usuario" },
  { key: "motivo", label: "Motivo" },
  { key: "referencia", label: "Referencia" },
  { key: "item", label: "Item" },
];

export default function MovimientosPage() {
  const navigate = useNavigate();
  const {
    movimientos,
    loading,
    pagination,
    itemId,
    setItemId,
    desde,
    setDesde,
    hasta,
    setHasta,
    changePage,
    reload,
  } = useMovimientos();

  const rows = movimientos.map(m => ({
    fecha: formatDate(m.ocurrido_en),
    tipo_badge: <TipoBadge tipo={m.tipo} />,
    subtipo_badge: <SubtipoBadge subtipo={m.subtipo} />,
    cantidad: formatNumber(m.cantidad),
    saldo: formatNumber(m.saldo_resultante),
    usuario: [m.usuario_nombres, m.usuario_apellidos].filter(Boolean).join(" ") || m.usuario_email || `ID ${m.usuario_id}`,
    motivo: m.motivo || "—",
    referencia: m.referencia_numero
      ? `${m.referencia_tipo} ${m.referencia_numero}`
      : (m.referencia_tipo || "—"),
    item: m.item_nombre || `Item ${m.item_id}`,
  }));

  const startItem = pagination.total > 0 ? (pagination.currentPage - 1) * pagination.perPage + 1 : 0;
  const endItem = Math.min(pagination.currentPage * pagination.perPage, pagination.total);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Movimientos de Inventario</h2>
          <p className="text-sm text-gray-400">Historial de entradas, salidas y ajustes</p>
        </div>
        <div className="flex gap-2">
          <Button text="Volver" icon={ArrowLeft} variant="outline" onClick={() => navigate(-1)} />
          <Button text="Refrescar" variant="outline" onClick={reload} disabled={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          placeholder="ID del Item"
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-auto" style={{ height: 500 }}>
          <DataTable
            columns={COLUMNS}
            rows={rows}
            loading={loading}
            empty="No hay movimientos registrados."
            defaultSort={{ key: "fecha", dir: "desc" }}
            pageSize={pagination.perPage}
            hidePagination={true}
          />
        </div>
        {pagination.total > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-sm text-gray-500">
                Mostrando {startItem} - {endItem} de {pagination.total} registros
              </span>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.lastPage}
                onPageChange={changePage}
                totalItems={pagination.total}
                pageSize={pagination.perPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
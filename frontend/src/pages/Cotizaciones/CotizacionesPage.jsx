import { Link } from "react-router-dom";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Send, 
  XCircle, 
  FileText, 
  Search 
} from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import DataTable from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/DataTable/Pagination";
import { useCotizaciones } from "./useCotizaciones";
import { formatMoney } from "../../services/dashboard.service";

const COLUMNS = [
  { key: "numero", label: "Número", sortable: true },
  { key: "cliente_nombre", label: "Cliente", sortable: true },
  { key: "estado_badge", label: "Estado", sortable: true },
  { key: "fecha", label: "Fecha", sortable: true },
  { key: "fecha_vencimiento", label: "Vence", sortable: true },
  { key: "total_formateado", label: "Total", sortable: true, align: "right" },
];

const ESTADO_STYLES = {
  BORRADOR: "bg-gray-100 text-gray-600",
  EMITIDA: "bg-emerald-100 text-emerald-600",
  VENCIDA: "bg-amber-100 text-amber-600",
  FACTURADA: "bg-blue-100 text-blue-600",
  ANULADA: "bg-red-100 text-red-600",
};

export default function CotizacionesPage() {
  const {
    cotizaciones,
    loading,
    error,
    pagination,
    search,
    setSearch,
    estado,
    setEstado,
    handleDelete,
    handleEmitir,
    handleAnular,
    changePage,
    reload
  } = useCotizaciones();

  const renderEstado = (estado) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_STYLES[estado] || ESTADO_STYLES.BORRADOR}`}>
      {estado}
    </span>
  );

  const rows = cotizaciones.map(c => ({
    id: c.id,
    numero: c.estado === "BORRADOR" ? (
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Borrador</span>
    ) : c.estado === "ANULADA" && !c.numero ? (
      <span className="text-xs font-medium text-red-400 uppercase tracking-wide">Anulada</span>
    ) : (
      <span className="font-mono font-medium text-blue-600">
        {c.numero || `#${c.id}`}
      </span>
    ),
    cliente_nombre: (
      <div className="font-semibold text-gray-800">
        {c.cliente?.nombre_razon_social || "—"}
      </div>
    ),
    estado_badge: renderEstado(c.estado),
    fecha: c.fecha?.substring(0, 10) || "—",
    fecha_vencimiento: c.fecha_vencimiento?.substring(0, 10) || "—",
    total_formateado: (
      <span className="font-semibold text-gray-900">
        {formatMoney(c.total)}
      </span>
    ),
    estado_raw: c.estado,
    numero_raw: c.numero
  }));

  const renderAcciones = (row) => {
    const isBorrador = row.estado_raw === "BORRADOR";
    const isEmitida = row.estado_raw === "EMITIDA";

    return (
      <div className="flex items-center gap-1">
        <Link to={`/cotizaciones/ver/${row.id}`}>
          <IconButton icon={Eye} title="Ver" variant="info" />
        </Link>
        
        {isBorrador && (
          <>
            <Link to={`/cotizaciones/editar/${row.id}`}>
              <IconButton icon={Pencil} title="Editar" variant="warning" />
            </Link>
            <IconButton
              icon={Send}
              title="Emitir"
              variant="success"
              onClick={() => handleEmitir(row.id)}
            />
            <IconButton
              icon={Trash2}
              title="Eliminar"
              variant="danger"
              onClick={() => handleDelete(row.id)}
            />
          </>
        )}

        {isEmitida && (
          <>
            <IconButton 
              icon={XCircle} 
              title="Anular" 
              variant="danger" 
              onClick={() => handleAnular(row.id)}
            />
            <Link to={`/facturas/nueva?cotizacion_id=${row.id}`}>
              <IconButton icon={FileText} title="Convertir a factura" variant="primary" />
            </Link>
          </>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center text-red-500">
          <XCircle className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-semibold mt-2">Error al cargar cotizaciones</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={reload} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cotizaciones</h2>
          <p className="text-sm text-gray-400">Gestión de presupuestos y propuestas</p>
        </div>
        <Link
          to="/cotizaciones/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} /> Nueva cotización
        </Link>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número o cliente..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="EMITIDA">Emitida</option>
            <option value="VENCIDA">Vencida</option>
            <option value="FACTURADA">Facturada</option>
            <option value="ANULADA">Anulada</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabla - altura fija con scroll */}
        <div className="overflow-auto" style={{ height: 500 }}>
          <DataTable
            columns={COLUMNS}
            rows={rows}
            actions={renderAcciones}
            loading={loading}
            empty="No hay cotizaciones registradas."
            defaultSort={{ key: "fecha", dir: "desc" }}
            pageSize={pagination.perPage}
            hidePagination={true}
          />
        </div>
        
        {/* Paginación - SIEMPRE visible */}
        {pagination.total > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.lastPage}
              onPageChange={changePage}
              totalItems={pagination.total}
              pageSize={pagination.perPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
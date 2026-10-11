import { Link } from "react-router-dom";
import { Search, Eye, DollarSign, ArrowLeft } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import DataTable from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/DataTable/Pagination";
import { ModalDetalleCompra } from "../../components/ui/ModalDetalleCompra";
import { ModalPagoCompra } from "../../components/ui/ModalPagoCompra";
import { useCompras } from "./useCompras";

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

const ESTADO_STYLES = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  PARCIAL: "bg-blue-100 text-blue-800",
  PAGADA: "bg-green-100 text-green-800",
  ANULADA: "bg-red-100 text-red-800",
};

const EstadoBadge = ({ estado }) => {
  const style = ESTADO_STYLES[estado] || "bg-gray-100 text-gray-800";
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>{estado}</span>;
};

const COLUMNS = [
  { key: "numero", label: "Número", sortable: true },
  { key: "proveedor", label: "Proveedor", sortable: true },
  { key: "detalle", label: "Detalle" },
  { key: "fecha", label: "Fecha", sortable: true },
  { key: "total", label: "Total", align: "right", sortable: true },
  { key: "saldo", label: "Saldo", align: "right", sortable: true },
  { key: "estado_badge", label: "Estado", align: "center" },
];

export default function ComprasPage() {
  const {
    compras,
    loading,
    pagination,
    search,
    setSearch,
    estado,
    setEstado,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    changePage,
    verDetalle,
    abrirPago,
    registrarPago,
    confirmarCompra,
    anularCompra,
    compraActual,
    showDetalleModal,
    setShowDetalleModal,
    showPagoModal,
    setShowPagoModal,
  } = useCompras();

  const rows = compras.map(c => ({
    id: c.id,
    numero: c.numero || "—",
    proveedor: c.proveedor?.nombre || "—",
    detalle: c.items?.[0]?.item?.nombre || "Sin detalle",
    fecha: formatDate(c.fecha),
    total: formatMoney(c.total),
    saldo_raw: c.saldo_pendiente,
    saldo: <span className={c.saldo_pendiente > 0 ? "text-red-600 font-semibold" : "text-green-600"}>{formatMoney(c.saldo_pendiente)}</span>,
    estado_badge: <EstadoBadge estado={c.estado} />,
    estado_raw: c.estado,
  }));

  const actions = (row) => (
    <div className="flex items-center gap-1 justify-end">
      <IconButton icon={Eye} onClick={() => verDetalle(row.id)} title="Ver detalle" variant="info" />
      {(row.estado_raw === "PENDIENTE" || row.estado_raw === "PARCIAL") && row.saldo_raw > 0 && (
        <IconButton icon={DollarSign} onClick={() => {
          const compra = compras.find(c => c.id === row.id);
          abrirPago(compra);
        }} title="Registrar pago" variant="success" />
      )}
    </div>
  );

  const startItem = pagination.total > 0 ? (pagination.currentPage - 1) * pagination.perPage + 1 : 0;
  const endItem = Math.min(pagination.currentPage * pagination.perPage, pagination.total);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-bag-check"></i> Compras
          </h2>
          <p className="text-sm text-gray-400">Registro de compras a proveedores</p>
        </div>
        <Link to="/catalogo" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          <ArrowLeft size={16} /> Catálogo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por número o proveedor..." className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PARCIAL">Parcial</option>
          <option value="PAGADA">Pagada</option>
          <option value="ANULADA">Anulada</option>
        </select>
        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-auto" style={{ height: 500 }}>
          <DataTable columns={COLUMNS} rows={rows} actions={actions} loading={loading} empty="No hay compras registradas." defaultSort={{ key: "fecha", dir: "desc" }} pageSize={pagination.perPage} hidePagination={true} />
        </div>
        {pagination.total > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-sm text-gray-500">Mostrando {startItem} - {endItem} de {pagination.total} registros</span>
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.lastPage} onPageChange={changePage} totalItems={pagination.total} pageSize={pagination.perPage} />
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <ModalDetalleCompra
        isOpen={showDetalleModal}
        onClose={() => setShowDetalleModal(false)}
        compra={compraActual}
        onConfirmar={confirmarCompra}
        onPagar={abrirPago}
        onAnular={anularCompra}
      />

      {/* Modal de pago */}
      <ModalPagoCompra
        key={compraActual ? `pago-${compraActual.id}-${showPagoModal}` : "pago-closed"}
        isOpen={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        compra={compraActual}
        onPagar={registrarPago}
      />
    </div>
  );
}
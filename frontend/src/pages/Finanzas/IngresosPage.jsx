// src/pages/Finanzas/IngresosPage.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCw, Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/DataTable/Pagination";
import { useIngresos } from "./useIngresos";
import IngresosModal from "./IngresosModal";
import { showConfirm } from "../../utils/notifications";

export default function IngresosPage() {
  const location = useLocation();
  const initialTipo = location.state?.tipo ?? "";

  const {
    ingresos,
    loading,
    totalFormatted,
    pagination,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    recargar,
    cambiarPagina,
    anularIngreso,
    formatDate,
  } = useIngresos(initialTipo);

  const [modalOpen, setModalOpen] = useState(false);
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);

  const handleNuevo = () => {
    setIngresoSeleccionado(null);
    setModalOpen(true);
  };

  const handleEditar = (row) => {
    const ingreso = ingresos.find(i => i.id === row.id);
    if (ingreso && ingreso.tipo === "INGRESO_MANUAL") {
      setIngresoSeleccionado(ingreso);
      setModalOpen(true);
    }
  };

  const handleAnular = async (row) => {
    const ingreso = ingresos.find(i => i.id === row.id);
    if (!ingreso) return;

    const label = ingreso.tipo === "VENTA_MOSTRADOR" ? "la venta" : ingreso.tipo === "PAGO_FACTURA" ? "el pago" : "el ingreso";
    const confirmed = await showConfirm(
      `¿Anular ${label} "${ingreso.recibo}"?`,
      { title: "Anular", okLabel: "Sí, anular" }
    );

    if (confirmed) {
      await anularIngreso(ingreso.id, ingreso.recibo, ingreso.tipo);
    }
  };

  const nombreUsuario = (u) => {
    if (!u) return null;
    return u.nombre_completo || [u.nombres, u.apellidos].filter(Boolean).join(" ").trim() || null;
  };

  const columns = [
    { key: "recibo", label: "Recibo", sortable: true },
    { key: "fecha_formatted", label: "Fecha", sortable: true },
    { key: "tipo_label", label: "Tipo", sortable: true },
    { key: "estado", label: "Estado" },
    { key: "vendedor", label: "Vendedor", sortable: false },
    { key: "forma_pago", label: "Forma pago" },
    { key: "referencia", label: "Referencia" },
    { key: "monto_formatted", label: "Monto", align: "right", sortable: true },
  ];

  const actions = (row) => {
    const ingreso = ingresos.find(i => i.id === row.id);
    const tipo = ingreso?.tipo;
    const anulado = ingreso?.estado === "ANULADO";

    if (tipo !== "INGRESO_MANUAL" && tipo !== "VENTA_MOSTRADOR" && tipo !== "PAGO_FACTURA") {
      return <span className="text-gray-400 text-sm">—</span>;
    }

    if (anulado) {
      return <span className="text-gray-400 text-sm">Anulado</span>;
    }

    return (
      <div className="flex gap-1">
        {tipo === "INGRESO_MANUAL" && (
          <button
            onClick={() => handleEditar(row)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Editar"
          >
            <i className="bi bi-pencil"></i>
          </button>
        )}
        <button
          onClick={() => handleAnular(row)}
          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Anular"
        >
          <i className="bi bi-slash-circle"></i>
        </button>
      </div>
    );
  };

  const rows = ingresos.map(i => {
    const anulador = nombreUsuario(i.anulado_por);
    const creador  = nombreUsuario(i.usuario);
    return {
    id: i.id,
    recibo: <span className="font-semibold text-gray-800">{i.recibo}</span>,
    fecha_formatted: <span className="text-gray-600 text-sm whitespace-nowrap">{i.fecha_formatted}</span>,
    tipo_label: (
      <div>
        <div className="font-medium text-gray-800">{i.tipo_label}</div>
        {i.descripcion && i.tipo !== "VENTA_MOSTRADOR" && (
          <div className="text-xs text-gray-500 mt-0.5 truncate max-w-40" title={i.descripcion}>
            {i.descripcion}
          </div>
        )}
        {i.cliente_nombre && i.tipo !== "INGRESO_MANUAL" && (
          <div className="text-xs text-gray-400 mt-0.5 truncate max-w-40" title={i.cliente_nombre}>
            {i.cliente_nombre}
          </div>
        )}
      </div>
    ),
    estado: i.estado === "ANULADO" ? (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          ANULADO
        </span>
        {anulador && <span className="text-xs text-gray-400">por: {anulador}</span>}
      </div>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        ACTIVO
      </span>
    ),
    vendedor: creador
      ? <span className="text-xs text-gray-500 leading-tight">{creador}</span>
      : null,
    forma_pago: <span className="text-gray-600 text-sm">{i.forma_pago}</span>,
    referencia: i.referencia && i.referencia !== "—" ? (
      <span className="text-gray-500 text-sm truncate max-w-30 block" title={i.referencia}>
        {i.referencia}
      </span>
    ) : null,
    monto_formatted: i.estado === "ANULADO" ? (
      <span className="text-gray-400 line-through">{i.monto_formatted}</span>
    ) : (
      <span className="text-green-600 font-semibold">{i.monto_formatted}</span>
    ),
  };});

  const footerTotales = (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Mostrando {ingresos.length} de {pagination.total} registros
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-gray-500">Total ingresos →</span>
          <span className="text-green-600 font-semibold min-w-32.5 text-right">
            {totalFormatted}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-trending-up text-green-500"></i>
            Ingresos
          </h1>
          <p className="text-sm text-gray-500">Pagos, ventas mostrador e ingresos manuales</p>
        </div>
        <div className="flex gap-2">
          <Link to="/finanzas">
            <Button text="Volver a finanzas" icon={ArrowLeft} variant="outline" />
          </Link>
          <Button text="Nuevo ingreso" icon={Plus} variant="primary" onClick={handleNuevo} />
          <Button text="Refrescar" icon={RefreshCw} variant="outline" onClick={recargar} disabled={loading} />
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              value={filtros.search}
              onChange={(e) => actualizarFiltros({ search: e.target.value })}
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filtros.tipo}
            onChange={(e) => actualizarFiltros({ tipo: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="PAGO_FACTURA">Pagos factura</option>
            <option value="VENTA_MOSTRADOR">Ventas mostrador</option>
            <option value="INGRESO_MANUAL">Ingresos manuales</option>
          </select>

          <select
            value={filtros.estado}
            onChange={(e) => actualizarFiltros({ estado: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Solo activos</option>
            <option value="ANULADO">Solo anulados</option>
          </select>
          
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) => actualizarFiltros({ desde: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Desde"
          />
          
          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) => actualizarFiltros({ hasta: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Hasta"
          />
          
          <div className="flex gap-2">
            <button
              onClick={recargar}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <i className="bi bi-search"></i>
              Filtrar
            </button>
            {(filtros.search || filtros.tipo || filtros.desde || filtros.hasta) && (
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <i className="bi bi-x-circle"></i>
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          rows={rows}
          actions={actions}
          loading={loading}
          empty={
            <div className="text-center py-8">
              <i className="bi bi-inbox text-gray-400 text-3xl block mb-2"></i>
              <p className="text-gray-500">Sin ingresos registrados</p>
              <Button text="Registrar ingreso" icon={Plus} variant="primary" className="mt-4" onClick={handleNuevo} />
            </div>
          }
        />

        {ingresos.length > 0 && footerTotales}

        {!loading && pagination.last_page > 1 && (
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={cambiarPagina}
            totalItems={pagination.total}
            pageSize={pagination.per_page}
          />
        )}
      </div>

      {/* Modal */}
      <IngresosModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setIngresoSeleccionado(null);
        }}
        ingreso={ingresoSeleccionado}
        onSuccess={recargar}
      />
    </div>
  );
}
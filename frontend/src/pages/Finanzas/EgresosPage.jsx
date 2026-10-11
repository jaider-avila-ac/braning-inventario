// src/pages/Finanzas/EgresosPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import { useEgresos } from "./useEgresos";
import EgresosModal from "./EgresosModal";
import { showConfirm } from "../../utils/notifications";

export default function EgresosPage() {
  const {
    egresos,
    loading,
    totalFormatted,
    pagination,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    recargar,
    cambiarPagina,
    anularEgreso,
  } = useEgresos();

  const [modalOpen, setModalOpen] = useState(false);
  const [egresoSeleccionado, setEgresoSeleccionado] = useState(null);

  const handleNuevo = () => {
    setEgresoSeleccionado(null);
    setModalOpen(true);
  };

  const handleEditar = (row) => {
    const egreso = egresos.find(e => e.id === row.id);
    if (egreso && egreso.tipo === "EGRESO_MANUAL") {
      setEgresoSeleccionado(egreso);
      setModalOpen(true);
    }
  };

  const handleAnular = async (row) => {
    const egreso = egresos.find(e => e.id === row.id);
    if (!egreso) return;

    const confirmed = await showConfirm(
      `¿Anular el egreso "${egreso.descripcion}"?`,
      { title: "Anular egreso", okLabel: "Sí, anular" }
    );
    
    if (confirmed) {
      await anularEgreso(egreso.id, egreso.descripcion);
    }
  };

  const nombreUsuario = (u) => {
    if (!u) return null;
    return u.nombre_completo || [u.nombres, u.apellidos].filter(Boolean).join(" ").trim() || null;
  };

  const columns = [
    { key: "recibo", label: "Recibo", sortable: true },
    { key: "fecha", label: "Fecha", sortable: true },
    { key: "descripcion", label: "Descripción", sortable: true },
    { key: "estado", label: "Estado" },
    { key: "vendedor", label: "Vendedor", sortable: false },
    { key: "archivo", label: "Archivo", align: "center" },
    { key: "notas", label: "Notas" },
    { key: "tipo_label", label: "Tipo", sortable: true, align: "center" },
    { key: "monto_formatted", label: "Monto", align: "right", sortable: true },
  ];

  const actions = (row) => {
    const egreso = egresos.find(e => e.id === row.id);
    const esManual = egreso?.tipo === "EGRESO_MANUAL";
    const anulado = egreso?.estado === "ANULADO";

    if (!esManual) {
      return <span className="text-gray-400 text-sm">—</span>;
    }

    if (anulado) {
      return <span className="text-gray-400 text-sm">Anulado</span>;
    }

    return (
      <div className="flex gap-1">
        <button
          onClick={() => handleEditar(row)}
          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Editar"
        >
          <i className="bi bi-pencil"></i>
        </button>
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

  const rows = egresos.map(e => {
    const anulador = nombreUsuario(e.anulado_por);
    const creador  = nombreUsuario(e.usuario);
    return {
    id: e.id,
    recibo: <span className="font-semibold text-gray-800">{e.recibo}</span>,
    fecha: <span className="text-gray-600 text-sm whitespace-nowrap">{e.fecha}</span>,
    descripcion: (
      <div>
        <div className="font-medium text-gray-800">{e.descripcion}</div>
        {e.proveedor_nombre && (
          <div className="text-xs text-gray-500 mt-0.5">{e.proveedor_nombre}</div>
        )}
      </div>
    ),
    estado: e.estado === "ANULADO" ? (
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
    archivo: e.archivo_url ? (
      <a
        href={e.archivo_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 justify-center"
        title={e.archivo_nombre}
      >
        <i className="bi bi-paperclip"></i>
        <span className="truncate max-w-25">{e.archivo_nombre || "Ver archivo"}</span>
      </a>
    ) : null,
    notas: e.notas && e.notas !== "—" ? (
      <span className="text-gray-500 text-sm truncate max-w-37.5 block" title={e.notas}>
        {e.notas}
      </span>
    ) : null,
    tipo_label: (
      <span className="inline-flex items-center gap-1 text-sm text-gray-600 justify-center">
        {e.tipo_icono && <i className={`bi ${e.tipo_icono}`}></i>}
        {e.tipo_label}
      </span>
    ),
    monto_formatted: e.estado === "ANULADO" ? (
      <span className="text-gray-400 line-through">{e.monto_formatted}</span>
    ) : (
      <span className="text-red-600 font-semibold">{e.monto_formatted}</span>
    ),
  };});

  const footerTotales = (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Mostrando {egresos.length} de {pagination.total} registros
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-gray-500">Total egresos →</span>
          <span className="text-red-600 font-semibold min-w-32.5 text-right">
            {totalFormatted}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-trending-down text-red-500"></i>
            Egresos
          </h1>
          <p className="text-sm text-gray-500">Compras y egresos manuales</p>
        </div>
        <div className="flex gap-2">
          <Link to="/finanzas">
            <Button text="Volver a finanzas" icon={ArrowLeft} variant="outline" />
          </Link>
          <Button text="Nuevo egreso" icon={Plus} variant="primary" onClick={handleNuevo} />
          <Button text="Refrescar" icon={RefreshCw} variant="outline" onClick={recargar} disabled={loading} />
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
            <option value="EGRESO_COMPRA">Compras</option>
            <option value="EGRESO_MANUAL">Manuales</option>
          </select>
          
          <select
            value={filtros.estado}
            onChange={(e) => actualizarFiltros({ estado: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="ANULADO">Anulados</option>
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
        </div>
        
        {(filtros.search || filtros.tipo || filtros.estado || filtros.desde || filtros.hasta) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={limpiarFiltros}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <i className="bi bi-x-circle"></i>
              Limpiar filtros
            </button>
          </div>
        )}
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
              <p className="text-gray-500">Sin egresos registrados</p>
              <Button text="Registrar egreso" icon={Plus} variant="primary" className="mt-4" onClick={handleNuevo} />
            </div>
          }
          searchKeys={["recibo", "descripcion", "proveedor_nombre"]}
          pageSize={pagination.per_page}
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          onPageChange={cambiarPagina}
        />
        
        {egresos.length > 0 && footerTotales}
      </div>

      {/* Modal */}
      <EgresosModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEgresoSeleccionado(null);
        }}
        egreso={egresoSeleccionado}
        onSuccess={recargar}
      />
    </div>
  );
}
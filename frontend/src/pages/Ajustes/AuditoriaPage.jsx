// src/pages/Ajustes/AuditoriaPage.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, X, RefreshCw, Eye, Smartphone, Laptop } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import DataTable from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/DataTable/Pagination";
import { useAuditoria } from "./useAuditoria";

const ACCION_OPTIONS = [
  { value: "", label: "Todas las acciones" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "CREAR", label: "Crear" },
  { value: "EDITAR", label: "Editar" },
  { value: "ELIMINAR", label: "Eliminar" },
  { value: "TOGGLE", label: "Cambiar estado" },
  { value: "CAMBIO_CLAVE", label: "Cambio contraseña" },
];

const MINUTOS_OPTIONS = [
  { value: "15", label: "Últimos 15 minutos" },
  { value: "30", label: "Últimos 30 minutos" },
  { value: "60", label: "Última hora" },
  { value: "120", label: "Últimas 2 horas" },
  { value: "360", label: "Últimas 6 horas" },
  { value: "720", label: "Últimas 12 horas" },
  { value: "1440", label: "Últimas 24 horas" },
];

export default function AuditoriaPage() {
  const navigate = useNavigate();
  const {
    // Auditoría
    auditoria,
    auditoriaLoading,
    auditoriaPagination,
    filtroUsuarioId,
    setFiltroUsuarioId,
    filtroAccion,
    setFiltroAccion,
    filtroDesde,
    setFiltroDesde,
    filtroHasta,
    setFiltroHasta,
    changeAuditoriaPage,
    // Sesiones
    sesiones,
    sesionesLoading,
    sesionesPagination,
    sesionesUsuarioId,
    changeSesionesPage,
    // Activos
    activos,
    activosLoading,
    minutos,
    setMinutos,
    recargarActivos,
    // Acciones
    handleBuscar,
    limpiarFiltros,
    formatDateTime,
    parseUserAgent,
    getAccionBadge,
  } = useAuditoria();

  // Columnas para auditoría
  const auditoriaColumns = [
    { key: "fecha", label: "Fecha/Hora", sortable: true },
    { key: "usuario", label: "Usuario", sortable: true },
    { key: "accion", label: "Acción", sortable: true, align: "center" },
    { key: "descripcion", label: "Descripción" },
    { key: "ip", label: "IP", sortable: true },
  ];

  const auditoriaRows = auditoria.map((item) => ({
    id: item.id,
    fecha: (
      <span className="text-xs text-gray-600 whitespace-nowrap">
        {formatDateTime(item.ocurrido_en)}
      </span>
    ),
    usuario: (
      <span className="text-sm font-medium text-gray-800">
        {item.usuario?.nombres 
          ? `${item.usuario.nombres} ${item.usuario.apellidos || ""}`.trim()
          : `ID ${item.usuario_id}`}
      </span>
    ),
    accion: (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getAccionBadge(item.accion)}`}>
        {item.accion}
      </span>
    ),
    entidad: (
      <span className="text-sm text-gray-600">
        {item.entidad} #{item.entidad_id || "—"}
      </span>
    ),
    descripcion: (
      <span className="text-sm text-gray-500 max-w-62.5 block truncate" title={item.descripcion}>
        {item.descripcion || "—"}
      </span>
    ),
    ip: <span className="text-xs font-mono text-gray-500">{item.ip || "—"}</span>,
  }));

  // Columnas para sesiones
  const sesionesColumns = [
    { key: "fecha", label: "Fecha/Hora", sortable: true },
    { key: "ip", label: "IP", sortable: true },
    { key: "dispositivo", label: "Dispositivo", sortable: true },
    { key: "browser", label: "Navegador", sortable: true },
    { key: "user_agent", label: "User Agent" },
  ];

  const sesionesRows = sesiones.map((item, idx) => {
    const { dispositivo, browser } = parseUserAgent(item.user_agent);
    return {
      id: item.id || idx,
      fecha: (
        <span className="text-xs text-gray-600 whitespace-nowrap">
          {formatDateTime(item.iniciado_en)}
        </span>
      ),
      ip: <span className="text-xs font-mono text-gray-500">{item.ip || "—"}</span>,
      dispositivo: (
        <span className="flex items-center gap-1 text-sm text-gray-600">
          {dispositivo === "Móvil" ? <Smartphone size={14} /> : <Laptop size={14} />}
          {dispositivo}
        </span>
      ),
      browser: <span className="text-sm text-gray-600">{browser}</span>,
      user_agent: (
        <span className="text-xs text-gray-400 max-w-70 block truncate" title={item.user_agent}>
          {item.user_agent || "—"}
        </span>
      ),
    };
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-clock-history text-purple-500"></i>
            Auditoría del Sistema
          </h1>
          <p className="text-sm text-gray-500">Historial de acciones y sesiones de usuarios</p>
        </div>
        <Button
          text="Volver a Usuarios"
          icon={ArrowLeft}
          variant="outline"
          onClick={() => navigate("/ajustes/usuarios")}
        />
      </div>

      {/* Usuarios activos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <i className="bi bi-circle-fill text-green-500 text-xs"></i>
            <span className="text-sm font-semibold text-gray-700">Usuarios activos ahora</span>
          </div>
          <div className="flex gap-2 items-center">
            <Select
              id="minutos"
              value={minutos}
              onChange={(e) => setMinutos(e.target.value)}
              options={MINUTOS_OPTIONS}
              className="min-w-45"
            />
            <Button
              icon={RefreshCw}
              variant="outline"
              size="sm"
              onClick={recargarActivos}
              disabled={activosLoading}
            />
          </div>
        </div>
        <div className="p-3">
          {activosLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">
              Sin actividad en los últimos {minutos} minutos.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activos.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-gray-50"
                >
                  <i className="bi bi-person-circle text-green-500"></i>
                  <span className="font-medium text-sm text-gray-800">
                    {user.nombres} {user.apellidos || ""}
                  </span>
                  <span className="text-xs text-gray-400">· {user.rol}</span>
                  <span className="text-xs text-gray-400">
                    {formatDateTime(user.last_login_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filtros Auditoría */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            id="filtro-usuario"
            label="ID de Usuario"
            type="number"
            placeholder="Ej: 1, 2, 3..."
            value={filtroUsuarioId}
            onChange={(e) => setFiltroUsuarioId(e.target.value)}
          />
          <Select
            id="filtro-accion"
            label="Acción"
            value={filtroAccion}
            onChange={(e) => setFiltroAccion(e.target.value)}
            options={ACCION_OPTIONS}
          />
          <Input
            id="filtro-desde"
            label="Desde"
            type="date"
            value={filtroDesde}
            onChange={(e) => setFiltroDesde(e.target.value)}
          />
          <Input
            id="filtro-hasta"
            label="Hasta"
            type="date"
            value={filtroHasta}
            onChange={(e) => setFiltroHasta(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <Button text="Buscar" icon={Search} variant="primary" onClick={handleBuscar} />
          <Button text="Limpiar" icon={X} variant="outline" onClick={limpiarFiltros} />
        </div>
      </div>

      {/* Tabla de Auditoría */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <i className="bi bi-clipboard-data"></i>
              Historial de auditoría
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {auditoriaPagination.total} registros
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <DataTable
            columns={auditoriaColumns}
            rows={auditoriaRows}
            loading={auditoriaLoading}
            empty="No hay registros de auditoría"
            pageSize={auditoriaPagination.perPage}
          />
        </div>
        {auditoriaPagination.lastPage > 1 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
            <Pagination
              currentPage={auditoriaPagination.currentPage}
              totalPages={auditoriaPagination.lastPage}
              onPageChange={changeAuditoriaPage}
              totalItems={auditoriaPagination.total}
              pageSize={auditoriaPagination.perPage}
            />
          </div>
        )}
      </div>

      {/* Sección de Sesiones (solo si hay usuario seleccionado) */}
      {sesionesUsuarioId && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <i className="bi bi-browser-chrome"></i>
                Sesiones del usuario ID: {sesionesUsuarioId}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {sesionesPagination.total} sesiones
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <DataTable
              columns={sesionesColumns}
              rows={sesionesRows}
              loading={sesionesLoading}
              empty="No hay sesiones registradas para este usuario"
              pageSize={10}
            />
          </div>
          {sesionesPagination.lastPage > 1 && (
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
              <Pagination
                currentPage={sesionesPagination.currentPage}
                totalPages={sesionesPagination.lastPage}
                onPageChange={changeSesionesPage}
                totalItems={sesionesPagination.total}
                pageSize={10}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
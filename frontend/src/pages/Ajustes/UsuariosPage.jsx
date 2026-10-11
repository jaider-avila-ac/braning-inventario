
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Plus, RefreshCw, X, UserCheck, UserX, Key, Building2, Mail, History } from "lucide-react";
import { useUsuarios } from "./useUsuarios";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import DataTable from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/DataTable/Pagination";

export default function UsuariosPage() {
  const navigate = useNavigate();


  const {
    loading, error, usuarios, pagination,
    search, setSearch,
    filtroRol, setFiltroRol,
    filtroActivo, setFiltroActivo,
    filtroEmpresaId, setFiltroEmpresaId,
    isSA, ROL_LABELS,
    limpiarFiltros, changePage, reload,
    handleToggleUsuario,
    abrirModalPassword,
    modalPasswordOpen, setModalPasswordOpen,
    selectedUser,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    passwordError, passwordSuccess,
    handleGuardarPassword,
    modalEmpresaOpen, setModalEmpresaOpen,
    empresaForm, setEmpresaForm,
    adminForm, setAdminForm,
    empresaError, empresaSuccess,
    creandoEmpresa,
    showPassword, setShowPassword,
    handleCrearEmpresaAdmin,
  } = useUsuarios();

  const columns = [
    {
      key: "nombres",
      label: "Nombre",
      render: (_, row) => (
        <span className="font-medium text-gray-800">
          {`${row.nombres} ${row.apellidos || ""}`.trim()}
        </span>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "rol",
      label: "Rol",
      render: (val) => {
        const info = ROL_LABELS[val] ?? { text: val, color: "bg-gray-100 text-gray-700 border-gray-200" };
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${info.color}`}>
            {info.text}
          </span>
        );
      },
    },
    ...(isSA
      ? [{
          key: "empresa",
          label: "Empresa",
          render: (_, row) => row.empresa?.nombre ?? <span className="text-gray-400">—</span>,
        }]
      : []),
    {
      key: "is_activo",
      label: "Estado",
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
          val
            ? "bg-green-100 text-green-700 border-green-200"
            : "bg-red-100 text-red-700 border-red-200"
        }`}>
          {val ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  const actions = (row) => (
    <div className="flex gap-1 justify-end">
      {/* Botón Auditoría */}
      <button
        onClick={() => navigate(`/ajustes/auditoria?usuario_id=${row.id}`)}
        title="Ver auditoría"
        className="p-1.5 rounded hover:bg-purple-50 text-purple-500 transition-colors"
      >
        <History size={15} />
      </button>
      {/* Botón Editar */}
      <button
        onClick={() => navigate(`/ajustes/usuario-form/${row.id}`)}
        title="Editar usuario"
        className="p-1.5 rounded hover:bg-blue-50 text-blue-500 transition-colors"
      >
        <i className="bi bi-pencil text-sm"></i>
      </button>
      {/* Botón Cambiar contraseña */}
      <button
        onClick={() => abrirModalPassword(row)}
        title="Cambiar contraseña"
        className="p-1.5 rounded hover:bg-orange-50 text-orange-500 transition-colors"
      >
        <Key size={15} />
      </button>
      {/* Botón Activar/Desactivar */}
      <button
        onClick={() =>
          handleToggleUsuario(
            row.id,
            `${row.nombres} ${row.apellidos || ""}`.trim(),
            row.is_activo
          )
        }
        title={row.is_activo ? "Desactivar usuario" : "Activar usuario"}
        className={`p-1.5 rounded transition-colors ${
          row.is_activo
            ? "hover:bg-red-50 text-red-500"
            : "hover:bg-green-50 text-green-600"
        }`}
      >
        {row.is_activo ? <UserX size={15} /> : <UserCheck size={15} />}
      </button>
    </div>
  );

  const ROL_OPTIONS = [
    { value: "", label: "Todos los roles" },
    ...(isSA ? [{ value: "SUPER_ADMIN", label: "Super Admin" }] : []),
    { value: "EMPRESA_ADMIN", label: "Empresa Admin" },
    { value: "OPERATIVO", label: "Operativo" },
  ];

  const ACTIVO_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "1", label: "Activos" },
    { value: "0", label: "Inactivos" },
  ];

  return (
    <div className="flex flex-col h-full gap-4 p-4">

      {/* Encabezado con botones */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Usuarios</h1>
          <p className="text-sm text-gray-500">Gestión de usuarios del sistema</p>
        </div>
        <div className="flex gap-2">
          {/* Botón Auditoría General */}
          <Button
            icon={History}
            text="Auditoría"
            variant="outline"
            onClick={() => navigate("/ajustes/auditoria")}
          />
          {/* Botón Brevo */}
          <Button
            icon={Mail}
            text="Brevo"
            variant="outline"
            onClick={() => navigate("/ajustes/brevo")}
          />

          {isSA && (
  <Button
    icon={Building2}
    text="Nueva Empresa"
    variant="primary"
    onClick={() => navigate("/empresas/nueva")}
  />
)}
          {/* Botón Nuevo Usuario */}
          <Button
            icon={Plus}
            text="Nuevo usuario"
            variant="primary"
            onClick={() => navigate("/ajustes/usuario-form")}
          />
          {/* Botón Refrescar */}
          <Button icon={RefreshCw} variant="outline" onClick={reload} title="Recargar lista" />
        </div>
      </div>

      {/* Panel SUPER_ADMIN */}
      {isSA && (
        <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-xl p-4 text-white">
          <div className="inline-flex items-center gap-1 bg-indigo-500/20 border border-indigo-400/30 rounded-md px-2 py-0.5 text-xs font-semibold text-indigo-300 mb-2">
            <i className="bi bi-shield-fill-check"></i> Super Admin · Acceso exclusivo
          </div>
          <h3 className="font-semibold text-indigo-200 text-sm mb-1">
            <i className="bi bi-building-add mr-1 text-indigo-400"></i>
            Crear nueva empresa y administrador
          </h3>
          <p className="text-indigo-300 text-xs mb-3">
            Registra una empresa en el sistema junto con su usuario administrador en un solo paso.
          </p>
          <Button
            icon={Building2}
            text="Nueva empresa + Admin"
            variant="primary"
            onClick={() => setModalEmpresaOpen(true)}
          />
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end shrink-0">
        <div className="flex-1 min-w-[200px]">
          <Input
            id="search-usuario"
            label=""
            placeholder="Buscar por nombre o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="min-w-[160px]">
          <Select
            id="filtro-rol"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            options={ROL_OPTIONS}
            placeholder="Todos los roles"
          />
        </div>
        <div className="min-w-[130px]">
          <Select
            id="filtro-activo"
            value={filtroActivo}
            onChange={(e) => setFiltroActivo(e.target.value)}
            options={ACTIVO_OPTIONS}
            placeholder="Todos"
          />
        </div>
        {isSA && (
          <div className="min-w-[150px]">
            <Input
              id="filtro-empresa"
              label=""
              type="number"
              placeholder="ID empresa"
              value={filtroEmpresaId}
              onChange={(e) => setFiltroEmpresaId(e.target.value)}
            />
          </div>
        )}
        <Button text="Limpiar filtros" variant="outline" onClick={limpiarFiltros} />
      </div>

      {/* Error */}
      {error && (
        <div className="shrink-0 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="flex-1 overflow-hidden">
        <DataTable
          columns={columns}
          rows={usuarios}
          actions={actions}
          loading={loading}
          empty="No hay usuarios registrados."
        />
      </div>

      {/* Paginación servidor */}
      {!loading && pagination.lastPage > 1 && (
        <div className="shrink-0">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.lastPage}
            onPageChange={changePage}
            totalItems={pagination.total}
            pageSize={pagination.perPage}
          />
        </div>
      )}

      {/* ── Modal cambiar contraseña ── */}
      {modalPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Key size={18} /> Cambiar contraseña
              </h2>
              <button
                onClick={() => setModalPasswordOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {selectedUser && (
              <p className="text-sm text-gray-500 mb-4">
                Usuario:{" "}
                <strong className="text-gray-700">
                  {selectedUser.nombres} {selectedUser.apellidos ?? ""}
                </strong>
              </p>
            )}

            <div className="flex flex-col gap-3">
              <div className="relative">
                <Input
                  id="new-password"
                  label="Nueva contraseña"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <Input
                id="confirm-password"
                label="Confirmar contraseña"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
              />

              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-600">{passwordSuccess}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <Button text="Cancelar" variant="outline" onClick={() => setModalPasswordOpen(false)} />
              <Button text="Guardar" variant="primary" onClick={handleGuardarPassword} />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal crear empresa + administrador ── */}
      {modalEmpresaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 my-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Building2 size={20} /> Nueva empresa y administrador
              </h2>
              <button
                onClick={() => setModalEmpresaOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Datos empresa */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Empresa
                </p>
                <div className="flex flex-col gap-3">
                  <Input
                    id="emp-nombre"
                    label="Nombre"
                    required
                    value={empresaForm.nombre}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, nombre: e.target.value })}
                  />
                  <Input
                    id="emp-nit"
                    label="NIT"
                    value={empresaForm.nit}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, nit: e.target.value })}
                  />
                  <Input
                    id="emp-telefono"
                    label="Teléfono"
                    value={empresaForm.telefono}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, telefono: e.target.value })}
                  />
                  <Input
                    id="emp-ciudad"
                    label="Ciudad"
                    value={empresaForm.ciudad}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, ciudad: e.target.value })}
                  />
                  <Input
                    id="emp-direccion"
                    label="Dirección"
                    value={empresaForm.direccion}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, direccion: e.target.value })}
                  />
                </div>
              </div>

              {/* Datos administrador */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Administrador
                </p>
                <div className="flex flex-col gap-3">
                  <Input
                    id="adm-nombres"
                    label="Nombres"
                    required
                    value={adminForm.nombres}
                    onChange={(e) => setAdminForm({ ...adminForm, nombres: e.target.value })}
                  />
                  <Input
                    id="adm-apellidos"
                    label="Apellidos"
                    value={adminForm.apellidos}
                    onChange={(e) => setAdminForm({ ...adminForm, apellidos: e.target.value })}
                  />
                  <Input
                    id="adm-email"
                    label="Email"
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  />
                  <div className="relative">
                    <Input
                      id="adm-password"
                      label="Contraseña"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 8 caracteres"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <Input
                    id="adm-password-conf"
                    label="Confirmar contraseña"
                    type="password"
                    value={adminForm.password_confirmation}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, password_confirmation: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {empresaError && (
              <p className="text-sm text-red-600 mt-4">{empresaError}</p>
            )}
            {empresaSuccess && (
              <p className="text-sm text-green-600 mt-4">{empresaSuccess}</p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button text="Cancelar" variant="outline" onClick={() => setModalEmpresaOpen(false)} />
              <Button
                icon={Plus}
                text={creandoEmpresa ? "Creando…" : "Crear empresa y admin"}
                variant="primary"
                disabled={creandoEmpresa}
                onClick={handleCrearEmpresaAdmin}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
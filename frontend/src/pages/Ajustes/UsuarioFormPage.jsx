// src/pages/Ajustes/UsuarioFormPage.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, KeyRound } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useUsuarioForm } from "./useUsuarioForm";

const ROL_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "EMPRESA_ADMIN", label: "Empresa Admin" },
  { value: "OPERATIVO", label: "Operativo" },
];

const ACTIVO_OPTIONS = [
  { value: "1", label: "Activo" },
  { value: "0", label: "Inactivo" },
];

export default function UsuarioFormPage() {
  const navigate = useNavigate();
  const {
    loading,
    saving,
    isEditing,
    isSA,
    cambiarPassActivo,
    setCambiarPassActivo,
    formData,
    handleChange,
    handleSubmit,
  } = useUsuarioForm();

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500">Cargando datos del usuario...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
        </h1>
        <Button
          text="Volver"
          icon={ArrowLeft}
          variant="outline"
          onClick={() => navigate("/ajustes/usuarios")}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="nombres"
              label="Nombres *"
              value={formData.nombres}
              onChange={handleChange}
              required
              placeholder="Ingrese los nombres"
            />
            <Input
              id="apellidos"
              label="Apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder="Ingrese los apellidos"
            />
            <Input
              id="email"
              label="Correo Electrónico *"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="correo@ejemplo.com"
            />
            <Select
              id="rol"
              label="Rol *"
              value={formData.rol}
              onChange={handleChange}
              options={ROL_OPTIONS}
            />
            {isSA && (
              <Input
                id="empresa_id"
                label="ID Empresa"
                type="number"
                value={formData.empresa_id}
                onChange={handleChange}
                placeholder="ID de la empresa"
              />
            )}
            <Select
              id="is_activo"
              label="Estado"
              value={formData.is_activo}
              onChange={handleChange}
              options={ACTIVO_OPTIONS}
            />
          </div>

          {/* Contraseña - solo para edición con botón toggle */}
          {isEditing && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCambiarPassActivo(!cambiarPassActivo)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <KeyRound size={14} />
                {cambiarPassActivo ? "Cancelar cambio de contraseña" : "Cambiar contraseña"}
              </button>
            </div>
          )}

          {(cambiarPassActivo || !isEditing) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <Input
                id="password"
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                placeholder={isEditing ? "Nueva contraseña (mín. 8 caracteres)" : "Mínimo 8 caracteres"}
              />
              <Input
                id="password_confirmation"
                label="Confirmar Contraseña"
                type="password"
                value={formData.password_confirmation}
                onChange={handleChange}
                required={!isEditing}
                placeholder="Repita la contraseña"
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              type="submit"
              text={saving ? "Guardando..." : "Guardar Usuario"}
              icon={Save}
              variant="primary"
              disabled={saving}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
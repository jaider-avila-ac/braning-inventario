import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { obtenerProveedor, crearProveedor, actualizarProveedor } from "../../services/proveedores.service";
import { showToast } from "../../utils/notifications";

export default function ProveedorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    contacto: "",
    email: "",
    telefono: "",
    direccion: "",
  });

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    obtenerProveedor(id)
      .then(data => {
        if (cancelled) return;
        setFormData({
          nombre: data.nombre || "",
          nit: data.nit || "",
          contacto: data.contacto || "",
          email: data.email || "",
          telefono: data.telefono || "",
          direccion: data.direccion || "",
        });
      })
      .catch(() => { if (!cancelled) showToast("Error al cargar el proveedor", "error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre) {
      showToast("El nombre es obligatorio", "error");
      return;
    }
    
    setSaving(true);
    try {
      if (isEditing) {
        await actualizarProveedor(id, formData);
        showToast("Proveedor actualizado correctamente", "success");
      } else {
        await crearProveedor(formData);
        showToast("Proveedor creado correctamente", "success");
      }
      navigate("/proveedores");
    } catch (error) {
      showToast(error.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando proveedor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
        </h1>
        <Button text="Volver" icon={ArrowLeft} variant="outline" onClick={() => navigate("/proveedores")} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                id="nombre"
                label="Nombre / Razón Social"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ingrese el nombre o razón social"
              />
            </div>

            <Input
              id="nit"
              label="NIT"
              value={formData.nit}
              onChange={handleChange}
              placeholder="Número de identificación tributaria"
            />

            <Input
              id="contacto"
              label="Contacto"
              value={formData.contacto}
              onChange={handleChange}
              placeholder="Nombre del contacto"
            />

            <Input
              id="email"
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
            />

            <Input
              id="telefono"
              label="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Número de teléfono"
            />

            <div className="md:col-span-2">
              <Input
                id="direccion"
                label="Dirección"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección completa"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="submit"
              text={saving ? "Guardando..." : "Guardar Proveedor"}
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
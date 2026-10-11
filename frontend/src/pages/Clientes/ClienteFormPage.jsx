import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { obtenerCliente, crearCliente, actualizarCliente } from "../../services/clientes.service";
import { showToast } from "../../utils/notifications";

const tiposDocumento = [
  { value: "CC",   label: "CC — Cédula de Ciudadanía" },
  { value: "NIT",  label: "NIT — Número de Identificación Tributaria" },
  { value: "CE",   label: "CE — Cédula de Extranjería" },
  { value: "PAS",  label: "PAS — Pasaporte" },
  { value: "OTRO", label: "OTRO" },
];

export default function ClienteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre_razon_social: "",
    empresa: "",
    tipo_documento: "CC",
    num_documento: "",
    contacto: "",
    email: "",
    telefono: "",
    direccion: ""
  });

  // Cargar cliente si es edición
  const loadCliente = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await obtenerCliente(id);
      const c = response?.cliente || response?.data || response;
      
      if (c) {
        setFormData({
          nombre_razon_social: c.nombre_razon_social || "",
          empresa: c.empresa || "",
          tipo_documento: c.tipo_documento || "CC",
          num_documento: c.num_documento || "",
          contacto: c.contacto || "",
          email: c.email || "",
          telefono: c.telefono || "",
          direccion: c.direccion || ""
        });
      }
    } catch (error) {
      console.error("Error cargando cliente:", error);
      showToast("Error al cargar el cliente", "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Efecto de carga inicial
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (isEditing && isMounted) {
        await loadCliente();
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [isEditing, loadCliente]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      if (isEditing) {
        await actualizarCliente(id, formData);
        showToast("Cliente actualizado correctamente", "success");
      } else {
        await crearCliente(formData);
        showToast("Cliente creado correctamente", "success");
      }
      navigate("/clientes");
    } catch (error) {
      showToast(error.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500">Cargando datos del cliente...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
        </h1>
        <Button
          text="Volver"
          icon={ArrowLeft}
          variant="outline"
          onClick={() => navigate("/clientes")}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Empresa y Nombre en la misma fila */}
      <Input
        id="empresa"
        label="Empresa"
        value={formData.empresa}
        onChange={handleChange}
        placeholder="Nombre de la empresa (si aplica)"
      />
      <Input
        id="nombre_razon_social"
        label="Nombre / Razón Social"
        value={formData.nombre_razon_social}
        onChange={handleChange}
        required
        placeholder="Ingrese el nombre o razón social"
      />

      {/* Tipo Documento y Documento */}
      <Select
        id="tipo_documento"
        label="Tipo Documento"
        value={formData.tipo_documento}
        onChange={handleChange}
        options={tiposDocumento}
      />
      <Input
        id="num_documento"
        label="Documento"
        value={formData.num_documento}
        onChange={handleChange}
        placeholder="Número de documento"
      />

      {/* Contacto y Email */}
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

      {/* Teléfono y Dirección */}
      <Input
        id="telefono"
        label="Teléfono"
        value={formData.telefono}
        onChange={handleChange}
        placeholder="Número de teléfono"
      />
      <Input
        id="direccion"
        label="Dirección"
        value={formData.direccion}
        onChange={handleChange}
        placeholder="Dirección completa"
      />
    </div>

    <div className="flex gap-3 mt-6">
      <Button
        type="submit"
        text={saving ? "Guardando..." : "Guardar Cliente"}
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
import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "../ui/Button";
import { crearCliente } from "../../services/clientes.service";
import { showToast } from "../../utils/notifications";

export default function ClienteRapidoModal({ isOpen, onClose, onCreated }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre_razon_social: "", tipo_documento: "CC", num_documento: "" });

  if (!isOpen) return null;

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre_razon_social.trim()) {
      showToast("El nombre es obligatorio", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await crearCliente({
        nombre_razon_social: form.nombre_razon_social.trim(),
        tipo_documento: form.tipo_documento || null,
        num_documento: form.num_documento.trim() || null,
      });
      if (!res.cliente) throw new Error(res.message || "Error al crear cliente");
      showToast("Cliente creado", "success");
      onCreated(res.cliente);
      setForm({ nombre_razon_social: "", tipo_documento: "CC", num_documento: "" });
      onClose();
    } catch (err) {
      showToast(err.message || "Error al crear cliente", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-800">Nuevo cliente rápido</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre o razón social <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nombre_razon_social}
              onChange={e => set("nombre_razon_social", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Juan García o Empresa S.A.S."
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo documento</label>
              <select
                value={form.tipo_documento}
                onChange={e => set("tipo_documento", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CC">CC</option>
                <option value="NIT">NIT</option>
                <option value="CE">CE</option>
                <option value="PAS">Pasaporte</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                type="text"
                value={form.num_documento}
                onChange={e => set("num_documento", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456789"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <Button text={saving ? "Guardando..." : "Crear cliente"} icon={UserPlus} type="submit" disabled={saving} />
          </div>
        </form>
      </div>
    </div>
  );
}

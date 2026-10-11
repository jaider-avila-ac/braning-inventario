// src/pages/Finanzas/IngresosModal.jsx
import { useState, useEffect, useRef } from "react";
import { crearIngreso, actualizarIngreso } from "../../services/ingresos.service";
import { showToast } from "../../utils/notifications";

export default function IngresosModal({ isOpen, onClose, ingreso, onSuccess }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState("");
  const [archivoNombre, setArchivoNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const isEditing = !!ingreso?.id;

  useEffect(() => {
    if (isOpen) {
      if (ingreso) {
        setDescripcion(ingreso.descripcion || "");
        setMonto(ingreso.monto?.toString() || "");
        setNotas(ingreso.notas || "");
        setArchivoUrl(ingreso.archivo_url || "");
        setArchivoNombre(ingreso.archivo_nombre || "");
      } else {
        setDescripcion("");
        setMonto("");
        setNotas("");
        setArchivoUrl("");
        setArchivoNombre("");
        setArchivo(null);
      }
      setError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen, ingreso]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
    if (file) {
      setArchivoNombre(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!descripcion.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }
    
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEditing) {
        await actualizarIngreso(ingreso.id, descripcion.trim(), montoNum, notas.trim() || null, archivo);
        showToast("Ingreso actualizado.", "success");
      } else {
        await crearIngreso(descripcion.trim(), montoNum, notas.trim() || null, archivo);
        showToast("Ingreso registrado.", "success");
      }

      if (onSuccess) await onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Editar ingreso manual" : "Nuevo ingreso manual"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Donación, Reintegro, Otros ingresos"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-100 file:text-gray-700
                hover:file:bg-gray-200
                cursor-pointer"
            />
            {archivoUrl && !archivo && (
              <div className="mt-2">
                <a
                  href={archivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <i className="bi bi-paperclip"></i>
                  {archivoNombre || "Ver archivo actual"}
                </a>
              </div>
            )}
            {archivo && (
              <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <i className="bi bi-check-circle"></i>
                {archivo.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas internas sobre este ingreso"
            />
          </div>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <i className="bi bi-exclamation-triangle me-1"></i>
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {isEditing ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
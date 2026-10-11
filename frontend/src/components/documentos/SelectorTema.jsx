import { useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { guardarTema } from "../../services/empresa.service";
import { showToast } from "../../utils/notifications";

const FORMATOS = [
  { id: "1", nombre: "Original", desc: "Tabla con bordes, cabecera clásica" },
  { id: "2", nombre: "Clásico", desc: "Barra lateral con datos de empresa" },
  { id: "3", nombre: "Minimal", desc: "Limpio, sin bordes, monospace" },
  { id: "4", nombre: "Corporativo", desc: "Banda superior de color, tarjetas" },
];

const COLORES_RAPIDOS = [
  "#1d4ed8", "#7c3a2d", "#0d7377", "#1b3a5c",
  "#16a34a", "#9333ea", "#dc2626", "#b45309",
  "#0891b2", "#374151",
];

export default function SelectorTema({ empresa, onClose, onGuardado }) {
  const [tema, setTema] = useState(empresa?.doc_tema ?? "1");
  const [color, setColor] = useState(empresa?.doc_color ?? "#1d4ed8");
  const [saving, setSaving] = useState(false);

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const updated = await guardarTema(tema, color);
      showToast("Presentación guardada", "success");
      onGuardado(updated);
      onClose();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Presentación del documento</h2>
            <p className="text-xs text-gray-400 mt-0.5">Se aplica a todas las facturas y cotizaciones de la empresa</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Selector de formato */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Formato</p>
            <div className="grid grid-cols-2 gap-2">
              {FORMATOS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setTema(f.id)}
                  className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                    tema === f.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    tema === f.id ? "border-blue-600 bg-blue-600" : "border-gray-300"
                  }`}>
                    {tema === f.id && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">F{f.id} · {f.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color de acento</p>
            <div className="flex items-center gap-3 flex-wrap">
              {COLORES_RAPIDOS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  title={c}
                  style={{ background: c }}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                    color === c ? "ring-2 ring-offset-2 ring-gray-600 scale-110" : ""
                  }`}
                />
              ))}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-7 h-7 rounded-full border-2 border-gray-300 cursor-pointer p-0.5"
                />
                <span className="text-xs text-gray-500">Personalizado</span>
              </label>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div style={{ background: color }} className="w-8 h-8 rounded-lg border border-gray-200" />
              <span className="text-sm font-mono text-gray-600">{color}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-5 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? "Guardando..." : "Guardar presentación"}
          </button>
        </div>
      </div>
    </div>
  );
}

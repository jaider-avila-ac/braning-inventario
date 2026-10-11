import { useRef } from "react";
import { CheckCircle, XCircle, Upload, FileSpreadsheet, X, AlertTriangle } from "lucide-react";

const PHASE_LABELS = {
  selected:   "Archivo listo para importar",
  uploading:  "Subiendo archivo...",
  processing: "Verificando datos uno por uno...",
  success:    "Importación completada",
  error:      "Errores de validación",
};

export default function ImportProgressModal({
  isOpen,
  onClose,
  phase = "selected",
  file = null,
  progress = 0,
  successCount = 0,
  errors = [],
  onConfirm,
  onFileChange,
  entityName = "registros",
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const isWorking = phase === "uploading" || phase === "processing";
  const isDone = phase === "success" || phase === "error";

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) onFileChange?.(f);
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800">Importar {entityName}</span>
          </div>
          {!isWorking && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Estado actual */}
          <div className="text-center">
            {phase === "success" && (
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            )}
            {phase === "error" && (
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
            )}
            {(phase === "uploading" || phase === "processing") && (
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            )}
            {phase === "selected" && (
              <Upload className="w-12 h-12 text-blue-400 mx-auto mb-2" />
            )}
            <p className="font-semibold text-gray-700">{PHASE_LABELS[phase]}</p>
          </div>

          {/* Fase: archivo seleccionado */}
          {phase === "selected" && file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          )}

          {/* Barra de progreso — upload real */}
          {phase === "uploading" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Enviando archivo al servidor...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Barra indeterminada — procesando */}
          {phase === "processing" && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500">El servidor está revisando cada registro del archivo...</p>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-500 h-2.5 rounded-full w-1/3 animate-[progress_1.2s_ease-in-out_infinite]"
                  style={{ animation: "progressBar 1.4s ease-in-out infinite" }} />
              </div>
            </div>
          )}

          {/* Éxito */}
          {phase === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
              <p className="text-green-700 font-semibold">
                {successCount} {entityName} importados correctamente
              </p>
            </div>
          )}

          {/* Errores */}
          {phase === "error" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                No se importó ningún registro. Corrija los siguientes errores en el archivo y vuelva a intentarlo:
              </p>
              <div className="border border-red-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-red-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-red-700">Fila</th>
                      <th className="px-3 py-2 text-left text-red-700">Campo</th>
                      <th className="px-3 py-2 text-left text-red-700">Problema</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {errors.map((e, i) => (
                      <tr key={i} className="bg-white">
                        <td className="px-3 py-2 font-mono text-red-600">{e.fila}</td>
                        <td className="px-3 py-2 text-gray-600">{e.campo}</td>
                        <td className="px-3 py-2 text-gray-700">{e.mensaje}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3 justify-end">
          {phase === "selected" && (
            <>
              <button
                onClick={handleFileClick}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cambiar archivo
              </button>
              <button
                onClick={() => onConfirm?.(file)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Importar
              </button>
            </>
          )}
          {isDone && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      <style>{`
        @keyframes progressBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}

import { useRef, useState, useEffect } from "react";
import { Upload, Download, ChevronDown } from "lucide-react";

export default function ImportDropdownButton({ onImport, onDownloadTemplate, label = "Importar" }) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImport?.(file);
    e.target.value = "";
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
      >
        <Upload className="w-4 h-4" />
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => { fileInputRef.current?.click(); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
          >
            <Upload className="w-4 h-4 shrink-0" />
            Importar archivo .xlsx
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={() => { onDownloadTemplate?.(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
          >
            <Download className="w-4 h-4 shrink-0" />
            Descargar plantilla .xlsx
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

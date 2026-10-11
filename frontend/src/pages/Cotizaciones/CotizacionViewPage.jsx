import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerCotizacion } from "../../services/cotizaciones.service";
import { obtenerEmpresa, obtenerLogoUrl, revocarLogoUrl } from "../../services/empresa.service";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import { ArrowLeft, Pencil, Printer, AlertTriangle, Loader2, Palette } from "lucide-react";
import DocumentoRenderer from "../../components/documentos/DocumentoRenderer";
import SelectorTema from "../../components/documentos/SelectorTema";
import { useAuth } from "../../context/AuthContext";

export default function CotizacionViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { perfil } = useAuth();

  const [data, setData] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);
  const blobRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cot, emp] = await Promise.all([
        obtenerCotizacion(id),
        obtenerEmpresa().catch(() => null),
      ]);
      setData(cot);
      setEmpresa(emp);
      if (emp?.logo_path) {
        try {
          const url = await obtenerLogoUrl();
          if (blobRef.current) revocarLogoUrl(blobRef.current);
          blobRef.current = url;
          setLogoUrl(url);
        } catch { /* logo no crítico */ }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const run = async () => { await loadData(); };
    run();
    return () => {
      if (blobRef.current) { revocarLogoUrl(blobRef.current); blobRef.current = null; }
    };
  }, [loadData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-blue-600">
      <Loader2 className="w-10 h-10 animate-spin" />
      <p className="mt-2 font-medium">Cargando cotización...</p>
    </div>
  );

  if (!data) return (
    <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-red-100">
      <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />
      <p className="mt-2 text-gray-600 font-semibold">No se encontró la cotización</p>
      <Button text="Volver" icon={ArrowLeft} onClick={() => navigate(-1)} className="mt-4" />
    </div>
  );

  const isAdmin = perfil?.rol === "EMPRESA_ADMIN";

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      {/* Toolbar — oculto al imprimir */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border print:hidden">
        <div className="flex gap-2">
          <IconButton icon={ArrowLeft} onClick={() => navigate("/cotizaciones")} title="Volver" />
          <IconButton icon={Pencil} onClick={() => navigate(`/cotizaciones/editar/${id}`)} variant="warning" title="Editar" />
          {isAdmin && (
            <IconButton icon={Palette} onClick={() => setShowSelector(true)} title="Cambiar presentación" />
          )}
        </div>
        <Button text="Imprimir / PDF" icon={Printer} onClick={() => window.print()} variant="primary" />
      </div>

      <div id="doc-print">
        <DocumentoRenderer data={data} empresa={empresa} logoUrl={logoUrl} tipo="Cotización" />
      </div>

      {showSelector && (
        <SelectorTema
          empresa={empresa}
          onClose={() => setShowSelector(false)}
          onGuardado={(updated) => setEmpresa(updated)}
        />
      )}
    </div>
  );
}

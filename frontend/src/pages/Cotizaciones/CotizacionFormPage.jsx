import { useNavigate } from "react-router-dom";
import DocumentoFormPage from "../../components/form/DocumentoFormPage";
import { useCotizacionForm } from "./useCotizacionForm";

export default function CotizacionFormPage() {
  const navigate = useNavigate();
  const { cotizacionId, numero, isEditing, ...rest } = useCotizacionForm();
  return (
    <>
      {!isEditing && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mx-4 mt-4 flex items-center justify-between">
          <div className="text-sm text-violet-700">
            <span className="font-semibold">Cotización normal</span> — selecciona ítems del catálogo.
            ¿Necesitas ingresar ítems libremente sin catálogo?
          </div>
          <button
            onClick={() => navigate("/cotizaciones/nueva-libre")}
            className="ml-4 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            Crear cotización libre →
          </button>
        </div>
      )}
      <DocumentoFormPage modo="cotizacion" documentoId={cotizacionId} numero={numero} isEditing={isEditing} {...rest} />
    </>
  );
}

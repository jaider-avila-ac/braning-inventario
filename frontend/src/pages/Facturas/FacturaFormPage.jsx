import { useNavigate } from "react-router-dom";
import DocumentoFormPage from "../../components/form/DocumentoFormPage";
import { useFacturaForm } from "./useFacturaForm";

export default function FacturaFormPage() {
  const navigate = useNavigate();
  const { facturaId, numero, isEditing, ...rest } = useFacturaForm();
  return (
    <>
      {!isEditing && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mx-4 mt-4 flex items-center justify-between">
          <div className="text-sm text-violet-700">
            <span className="font-semibold">Factura normal</span> — selecciona ítems del catálogo.
            ¿Necesitas ingresar ítems libremente sin catálogo?
          </div>
          <button
            onClick={() => navigate("/facturas/nueva-libre")}
            className="ml-4 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            Crear factura libre →
          </button>
        </div>
      )}
      <DocumentoFormPage modo="factura" documentoId={facturaId} numero={numero} isEditing={isEditing} {...rest} />
    </>
  );
}

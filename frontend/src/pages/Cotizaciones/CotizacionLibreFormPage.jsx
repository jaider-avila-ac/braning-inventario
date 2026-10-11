import DocumentoLibreFormPage from "../../components/form/DocumentoLibreFormPage";
import { useCotizacionLibreForm } from "./useCotizacionLibreForm";

export default function CotizacionLibreFormPage() {
  const { cotizacionId, numero, ...rest } = useCotizacionLibreForm();
  return <DocumentoLibreFormPage modo="cotizacion" documentoId={cotizacionId} numero={numero} {...rest} />;
}

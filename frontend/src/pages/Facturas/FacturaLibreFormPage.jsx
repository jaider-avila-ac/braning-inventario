import DocumentoLibreFormPage from "../../components/form/DocumentoLibreFormPage";
import { useFacturaLibreForm } from "./useFacturaLibreForm";

export default function FacturaLibreFormPage() {
  const { facturaId, numero, ...rest } = useFacturaLibreForm();
  return <DocumentoLibreFormPage modo="factura" documentoId={facturaId} numero={numero} {...rest} />;
}

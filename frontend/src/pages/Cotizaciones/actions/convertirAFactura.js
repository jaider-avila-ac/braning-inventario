import { convertirAFactura as convertirAFacturaService } from "../../../services/cotizaciones.service";
import { showToast, showConfirm } from "../../../utils/notifications";

export async function convertirAFactura(cotizacionId, navigate) {
  const confirmed = await showConfirm("¿Convertir esta cotización a factura?", {
    title: "Convertir a factura",
    okLabel: "Sí, convertir"
  });
  
  if (!confirmed) return false;
  
  try {
    const data = await convertirAFacturaService(cotizacionId);
    showToast(data.message || "Cotización convertida a factura", "success");
    
    if (data.factura?.id) {
      navigate(`/facturas/editar/${data.factura.id}`);
    } else if (data.id) {
      navigate(`/facturas/editar/${data.id}`);
    }
    return true;
  } catch (error) {
    showToast(error.message, "error");
    return false;
  }
}
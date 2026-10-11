import { anularCotizacion as anularCotizacionService } from "../../../services/cotizaciones.service";
import { showToast, showConfirm } from "../../../utils/notifications";

export async function anularCotizacion(cotizacionId, onSuccess) {
  const confirmed = await showConfirm("¿Anular esta cotización? Esta acción no se puede deshacer.", {
    title: "Anular cotización",
    okLabel: "Sí, anular"
  });
  
  if (!confirmed) return false;
  
  try {
    await anularCotizacionService(cotizacionId);
    showToast("Cotización anulada", "success");
    if (onSuccess) await onSuccess();
    return true;
  } catch (error) {
    showToast(error.message, "error");
    return false;
  }
}
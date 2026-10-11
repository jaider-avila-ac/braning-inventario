import { emitirCotizacion as emitirCotizacionService } from "../../../services/cotizaciones.service";
import { showToast, showConfirm } from "../../../utils/notifications";

export async function emitirCotizacion(cotizacionId, onSuccess) {
  const confirmed = await showConfirm("¿Emitir esta cotización?", {
    title: "Emitir cotización",
    okLabel: "Sí, emitir"
  });
  
  if (!confirmed) return false;
  
  try {
    await emitirCotizacionService(cotizacionId);
    showToast("Cotización emitida", "success");
    if (onSuccess) await onSuccess();
    return true;
  } catch (error) {
    showToast(error.message, "error");
    return false;
  }
}
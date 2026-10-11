import { confirmarVigencia as confirmarVigenciaService } from "../../../services/cotizaciones.service";
import { showToast, showPrompt } from "../../../utils/notifications";

export async function confirmarVigencia(cotizacionId, fechaActual, onSuccess) {
  const nuevaFecha = await showPrompt("Nueva fecha de vencimiento (YYYY-MM-DD):", {
    title: "Confirmar vigencia",
    defaultValue: fechaActual || ""
  });
  
  if (!nuevaFecha) return false;
  
  try {
    await confirmarVigenciaService(cotizacionId, nuevaFecha);
    showToast("Vigencia confirmada", "success");
    if (onSuccess) await onSuccess();
    return true;
  } catch (error) {
    showToast(error.message, "error");
    return false;
  }
}
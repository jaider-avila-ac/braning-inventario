import { emitirFactura as emitirFacturaService } from "../../../services/facturas.service";
import { showToast, showConfirm } from "../../../utils/notifications";

export async function emitirFactura(facturaId, onSuccess) {
  const confirmed = await showConfirm("¿Emitir esta factura?", {
    title: "Emitir factura",
    okLabel: "Sí, emitir",
  });
  if (!confirmed) return false;
  try {
    await emitirFacturaService(facturaId);
    showToast("Factura emitida", "success");
    if (onSuccess) await onSuccess();
    return true;
  } catch (error) {
    showToast(error.message, "error");
    return false;
  }
}

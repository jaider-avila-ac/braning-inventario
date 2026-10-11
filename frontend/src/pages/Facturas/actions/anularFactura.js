import { anularFactura as anularFacturaService } from "../../../services/facturas.service";
import { showToast, showConfirm } from "../../../utils/notifications";

export async function anularFactura(facturaId, onSuccess) {
  const confirmed = await showConfirm("¿Anular esta factura? Esta acción no se puede deshacer.", {
    title: "Anular factura",
    okLabel: "Sí, anular",
  });
  if (!confirmed) return false;
  try {
    await anularFacturaService(facturaId);
    showToast("Factura anulada", "success");
    if (onSuccess) await onSuccess();
    return true;
  } catch (error) {
    showToast(error.message, "error");
    return false;
  }
}

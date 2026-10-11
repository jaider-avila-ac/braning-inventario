import Swal from 'sweetalert2';

// Formateador de moneda
export function formatMoney(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(value || 0);
}

// Formateador de números
export function formatNumber(value) {
  const num = value || 0;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(0) + "k";
  return num.toString();
}

// Toast notifications
export function showToast(message, type = "success") {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
  
  let icon = 'success';
  if (type === 'error') icon = 'error';
  if (type === 'warning') icon = 'warning';
  if (type === 'info') icon = 'info';
  
  Toast.fire({
    icon,
    title: message
  });
}

// Confirm dialog
export async function showConfirm(message, options = {}) {
  const result = await Swal.fire({
    title: options.title || "Confirmar",
    html: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: options.okLabel || "Sí, continuar",
    cancelButtonText: options.cancelLabel || "Cancelar"
  });
  
  return result.isConfirmed;
}

// Prompt dialog
export async function showPrompt(message, options = {}) {
  const result = await Swal.fire({
    title: options.title || "Ingresar valor",
    html: message,
    input: 'text',
    inputValue: options.defaultValue || "",
    showCancelButton: true,
    confirmButtonText: options.okLabel || "Confirmar",
    cancelButtonText: options.cancelLabel || "Cancelar",
    inputValidator: (value) => {
      if (!value && options.required !== false) {
        return 'Este campo es requerido';
      }
    }
  });
  
  return result.isConfirmed ? result.value : null;
}
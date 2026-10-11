import { apiFetch } from "./api";

export async function obtenerDashboard() {
  try {
    const res = await apiFetch("/dashboard");
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data?.message || "Error al cargar dashboard");
    }

    const resumen = data.resumen || {};
    const ultimasFacturas = data.ultimas_facturas || [];
    const ultimosPagos = data.ultimos_pagos || [];

    return {
      resumen: {
        total_clientes: resumen.total_clientes || 0,
        total_items: resumen.total_items || 0,
        cotizaciones_activas: resumen.cotizaciones_activas || 0,
        facturas_borrador: resumen.facturas_borrador || 0,
        facturas_emitidas: resumen.facturas_emitidas || 0,
        total_en_caja: resumen.total_en_caja || 0,
        balance_real: resumen.balance_real || 0,
        saldo_pendiente: resumen.saldo_pendiente || 0,
        total_pagado: resumen.total_pagado || 0,
        ingresos_hoy: resumen.ingresos_hoy || 0,
      },
      ultimasFacturas,
      ultimosPagos,
    };
  } catch (error) {
    console.error("Error obtener dashboard:", error);
    throw error;
  }
}

export function formatMoney(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(value || 0);
}

export function formatNumber(value) {
  const num = value || 0;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(0) + "k";
  return num.toString();
}

export const FORMAS_PAGO = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  BILLETERA: "Billetera",
  OTRO: "Otro",
};
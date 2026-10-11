// src/services/reportes.service.js
import { apiFetch } from "./api";

/**
 * Obtiene el reporte financiero COMPLETO (KPIs + Rendimiento de ítems)
 * 
 * @param {Object} params - Parámetros del reporte
 * @param {string} params.desde - Fecha inicio (YYYY-MM-DD)
 * @param {string} params.hasta - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Object>} Datos del reporte
 * 
 * @example
 * const data = await getReporteFinanciero({ desde: "2025-01-01", hasta: "2025-01-31" });
 * 
 * @returns {Object} Respuesta con la siguiente estructura:
 * {
 *   total_facturado: number,
 *   total_cobrado: number,
 *   saldo_pendiente: number,
 *   ingresos_facturas: number,
 *   ingresos_mostrador: number,
 *   ingresos_manuales: number,
 *   total_ingresos: number,
 *   egresos_compras: number,
 *   egresos_manuales: number,
 *   total_egresos: number,
 *   compras_contado: number,
 *   credito_pendiente: number,
 *   balance_real: number,
 *   rendimiento_items: Array,
 *   resumen: { desde, hasta }
 * }
 */
export async function getReporteFinanciero({ desde, hasta } = {}) {
    const qs = new URLSearchParams();
    if (desde) qs.append("desde", desde);
    if (hasta) qs.append("hasta", hasta);

    const url = qs.toString() ? `/reportes/financiero?${qs}` : "/reportes/financiero";
    const res = await apiFetch(url);
    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || "Error cargando reporte financiero");

    return data;
}

/**
 * Obtiene SOLO los KPIs financieros (sin rendimiento de ítems)
 * 
 * @param {Object} params - Parámetros del reporte
 * @param {string} params.desde - Fecha inicio (YYYY-MM-DD)
 * @param {string} params.hasta - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Object>} Datos del reporte
 * 
 * @example
 * const data = await getReporteKPIs({ desde: "2025-01-01", hasta: "2025-01-31" });
 * 
 * @returns {Object} Respuesta con la siguiente estructura:
 * {
 *   total_facturado: number,
 *   total_cobrado: number,
 *   saldo_pendiente: number,
 *   ingresos_facturas: number,
 *   ingresos_mostrador: number,
 *   ingresos_manuales: number,
 *   total_ingresos: number,
 *   egresos_compras: number,
 *   egresos_manuales: number,
 *   total_egresos: number,
 *   compras_contado: number,
 *   credito_pendiente: number,
 *   balance_real: number,
 *   resumen: { desde, hasta }
 * }
 */
export async function getReporteKPIs({ desde, hasta } = {}) {
    const qs = new URLSearchParams();
    if (desde) qs.append("desde", desde);
    if (hasta) qs.append("hasta", hasta);

    const url = qs.toString() ? `/reportes/kpis?${qs}` : "/reportes/kpis";
    const res = await apiFetch(url);
    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || "Error cargando KPIs");

    return data;
}

/**
 * Obtiene SOLO el rendimiento de ítems (sin KPIs)
 * 
 * @param {Object} params - Parámetros del reporte
 * @param {string} params.desde - Fecha inicio (YYYY-MM-DD)
 * @param {string} params.hasta - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Object>} Datos del reporte
 * 
 * @example
 * const data = await getRendimientoItems({ desde: "2025-01-01", hasta: "2025-01-31" });
 * 
 * @returns {Object} Respuesta con la siguiente estructura:
 * {
 *   rendimiento_items: Array<{
 *     item_id: number,
 *     item_nombre: string,
 *     item_tipo: string,
 *     precio_compra: number,
 *     valor_unitario_promedio: number,
 *     unidad: string,
 *     cantidad_disponible: number,
 *     cantidad_vendida: number,
 *     total_subtotal: number,
 *     total_descuento: number,
 *     total_iva: number,
 *     total_ventas: number,
 *     total_costo: number,
 *     ganancia_neta: number,
 *     margen_ganancia: number
 *   }>,
 *   resumen: {
 *     desde: string,
 *     hasta: string,
 *     total_items: number
 *   }
 * }
 */
export async function getRendimientoItems({ desde, hasta } = {}) {
    const qs = new URLSearchParams();
    if (desde) qs.append("desde", desde);
    if (hasta) qs.append("hasta", hasta);

    const url = qs.toString() ? `/reportes/rendimiento-items?${qs}` : "/reportes/rendimiento-items";
    const res = await apiFetch(url);
    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || "Error cargando rendimiento de ítems");

    return data;
}
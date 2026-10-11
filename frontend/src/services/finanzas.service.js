import { apiFetch, csrfCookie } from "./api";

// ─── Facturas ────────────────────────────────────────────────────────────────
export async function listarFacturas({ search = "", estado = "", cliente_id = "" } = {}) {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (estado) qs.set("estado", estado);
  if (cliente_id) qs.set("cliente_id", cliente_id);
  const res = await apiFetch(`/facturas?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al listar facturas");
  return data;
}

export async function obtenerFactura(id) {
  const res = await apiFetch(`/facturas/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar factura");
  return data.factura;
}

export async function crearFactura(payload) {
  await csrfCookie();
  const res = await apiFetch("/facturas", { method: "POST", body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al crear factura");
  return data.factura;
}

export async function actualizarFactura(id, payload) {
  await csrfCookie();
  const res = await apiFetch(`/facturas/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al actualizar factura");
  return data.factura;
}

export async function eliminarFactura(id) {
  await csrfCookie();
  const res = await apiFetch(`/facturas/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo eliminar");
  return data;
}

export async function emitirFactura(id) {
  await csrfCookie();
  const res = await apiFetch(`/facturas/${id}/emitir`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo emitir");
  return data.factura;
}

export async function anularFactura(id) {
  await csrfCookie();
  const res = await apiFetch(`/facturas/${id}/anular`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo anular");
  return data.factura;
}

// ─── Facturas pendientes ─────────────────────────────────────────────────────
export async function facturasPendientes({ search = "" } = {}) {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("pendiente", "true");

  const res = await apiFetch(`/facturas?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar pendientes");
  return data;
}

// ⭐ Buscar factura por número exacto (para cobro rápido)
export async function buscarFacturaPorNumero(numero) {
  const res = await apiFetch(`/facturas?search=${encodeURIComponent(numero)}&estado=EMITIDA`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al buscar factura");
  
  const rows = data.data || [];
  // Buscar coincidencia exacta por número
  const factura = rows.find(f => f.numero?.toLowerCase() === numero.toLowerCase());
  
  if (!factura) return null;
  
  // Obtener detalles completos de la factura
  const resDetalle = await apiFetch(`/facturas/${factura.id}`);
  const detalle = await resDetalle.json();
  if (!resDetalle.ok) throw new Error(detalle?.message || "Error al cargar detalle de factura");
  
  return detalle.factura;
}

// ─── Dashboard Resumen ───────────────────────────────────────────────────────
// Cuando se proveen desde+hasta usa /reportes/kpis (filtrado por fecha).
// Sin fechas usa /dashboard (totales históricos de empresa_resumen).
export async function getResumen(params = {}) {
  const { desde, hasta } = params;

  if (desde && hasta) {
    const qs = new URLSearchParams({ desde, hasta });
    const res = await apiFetch(`/reportes/kpis?${qs}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al cargar resumen");
    return {
      ingresos_facturas:  data.ingresos_facturas  ?? 0,
      ingresos_mostrador: data.ingresos_mostrador ?? 0,
      ingresos_manuales:  data.ingresos_manuales  ?? 0,
      total_en_caja:      data.total_ingresos      ?? 0,
      egresos_compras:    data.egresos_compras     ?? 0,
      egresos_manuales:   data.egresos_manuales    ?? 0,
      total_egresos:      data.total_egresos       ?? 0,
      balance_real:       data.balance_real        ?? 0,
      saldo_pendiente:    data.saldo_pendiente     ?? 0,
      cuentas_por_pagar:  data.cuentas_por_pagar   ?? 0,
    };
  }

  const res = await apiFetch("/dashboard");
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar resumen");
  const r = data.resumen || data;
  return {
    ingresos_facturas:  r.ingresos_facturas   ?? 0,
    ingresos_mostrador: r.ingresos_mostrador  ?? 0,
    ingresos_manuales:  r.ingresos_manuales   ?? 0,
    total_en_caja:      r.total_en_caja       ?? 0,
    egresos_compras:    r.egresos_compras     ?? 0,
    egresos_manuales:   r.egresos_manuales_tot ?? 0,
    total_egresos:      r.total_egresos       ?? 0,
    balance_real:       r.balance_real        ?? 0,
    saldo_pendiente:    r.saldo_pendiente     ?? 0,
    cuentas_por_pagar:  r.cuentas_por_pagar   ?? 0,
  };
}


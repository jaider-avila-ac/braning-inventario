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
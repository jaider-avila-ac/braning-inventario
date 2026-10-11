import { apiFetch, csrfCookie } from "./api";

export async function listarCompras(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") qs.set(k, v);
  });

  const res = await apiFetch(`/compras?${qs.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo listar compras.");
  return data;
}

export async function obtenerPagosDeCompra(compraId) {
  const res = await apiFetch(`/egresos/compras/por-compra/${compraId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudieron obtener los pagos.");
  return data;
}

export async function obtenerCompra(id) {
  const res = await apiFetch(`/compras/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo obtener la compra.");
  return data;
}

export async function confirmarCompra(id) {
  await csrfCookie();
  const res = await apiFetch(`/compras/${id}/confirmar`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo confirmar la compra.");
  return data;
}

export async function anularCompra(id) {
  await csrfCookie();
  const res = await apiFetch(`/compras/${id}/anular`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo anular la compra.");
  return data;
}

export async function registrarPagoCompra(id, payload) {
  await csrfCookie();
  
  const data = {
    fecha: payload.fecha,
    monto: payload.monto,
    medio_pago: payload.medio_pago,
    descripcion: payload.descripcion || `Pago de compra`,
    notas: payload.notas || null,
  };
  
  const res = await apiFetch(`/compras/${id}/pagar`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  const result = await res.json();
  if (!res.ok) throw new Error(result?.message || "Error al registrar pago");
  return result;
}

export async function cuentasPorPagar(params = {}) {
  const qs = new URLSearchParams();
  if (params.proveedor_id) qs.set("proveedor_id", params.proveedor_id);
  
  const res = await apiFetch(`/compras/cuentas-por-pagar?${qs.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo consultar cuentas por pagar.");
  return data;
}
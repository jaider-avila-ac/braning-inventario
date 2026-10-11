import { apiFetch, csrfCookie } from "./api";
import { API_BASE_URL, TOKEN_KEY } from "../config/config";

export async function listarItems({ page = 1, search = "", tipo = "", soloControla = "0", perPage = 10 } = {}) {
  const qs = new URLSearchParams();
  qs.set("page", page);
  qs.set("per_page", perPage);
  if (search) qs.set("search", search);
  if (tipo) qs.set("tipo", tipo);
  if (soloControla === "1") qs.set("controla_inventario", "1");
  
  const res = await apiFetch(`/items?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al listar items");
  
  return {
    data: data.data || [],
    current_page: data.current_page || 1,
    last_page: data.last_page || 1,
    per_page: data.per_page || perPage,
    total: data.total || 0,
    from: data.from || 0,
    to: data.to || 0,
  };
}

export async function obtenerItem(id) {
  const res = await apiFetch(`/items/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar item");
  return data.item || data;
}

export async function crearItem(formData) {
  await csrfCookie();

  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE_URL}/api/items`, {
    method: "POST",
    body: formData,
    headers: {
      "Accept": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al crear item");
  return data;
}

export async function actualizarItem(id, payload) {
  await csrfCookie();
  const res = await apiFetch(`/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al actualizar item");
  return data;
}

export async function eliminarItem(id) {
  await csrfCookie();
  const res = await apiFetch(`/items/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al eliminar item");
  return data;
}

export async function registrarMovimientoItem(id, data, archivo = null) {
  await csrfCookie();
  const token = localStorage.getItem(TOKEN_KEY);

  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      fd.append(key, value);
    }
  });
  if (archivo) fd.append("archivo", archivo);

  const res = await fetch(`${API_BASE_URL}/api/items/${id}/movimiento`, {
    method: "POST",
    body: fd,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result?.message || "Error al registrar movimiento");
  return result;
}

export async function listarComprasItem(itemId) {
  const res = await apiFetch(`/items/${itemId}/compras`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al listar compras del item");
  return data;
}

export async function editarCompraItem(itemId, compraId, payload) {
  await csrfCookie();
  const res = await apiFetch(`/items/${itemId}/compras/${compraId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al editar compra");
  return data;
}

export async function ajustarInventario(payload) {
  await csrfCookie();
  const res = await apiFetch("/stock/ajustar", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al ajustar inventario");
  return data;
}
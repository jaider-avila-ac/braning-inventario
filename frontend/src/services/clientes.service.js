import { apiFetch, csrfCookie, uploadWithProgress } from "./api";

export async function listarClientes({ search = "", page = 1, perPage = 10 } = {}) {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (page) qs.set("page", page);
  if (perPage) qs.set("per_page", perPage);
  
  const res = await apiFetch(`/clientes?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al listar clientes");
  return data;
}

export async function obtenerCliente(id) {
  const res = await apiFetch(`/clientes/${id}`);
  return res.json();
}

export async function crearCliente(data) {
  await csrfCookie();
  const res = await apiFetch("/clientes", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function actualizarCliente(id, data) {
  await csrfCookie();
  const res = await apiFetch(`/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export function importarClientes(file, { onUploadProgress, onProcessing } = {}) {
  return uploadWithProgress("/clientes/importar", file, { onUploadProgress, onProcessing });
}

export async function eliminarCliente(id) {
  await csrfCookie();
  const res = await apiFetch(`/clientes/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "No se pudo eliminar el cliente");
  return data;
}
import { apiFetch, csrfCookie, uploadWithProgress } from "./api";

export async function listarProveedores({ search = "", activos = "1", page = 1, perPage = 10 } = {}) {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (activos) qs.set("activos", activos);
  if (page) qs.set("page", page);
  if (perPage) qs.set("per_page", perPage);
  
  const res = await apiFetch(`/proveedores?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al listar proveedores");
  
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

export async function obtenerProveedor(id) {
  const res = await apiFetch(`/proveedores/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar proveedor");
  return data.data || data.proveedor || data;
}

export async function crearProveedor(data) {
  await csrfCookie();
  const res = await apiFetch("/proveedores", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result?.message || "Error al crear proveedor");
  return result.data || result.proveedor || result;
}

export async function actualizarProveedor(id, data) {
  await csrfCookie();
  const res = await apiFetch(`/proveedores/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result?.message || "Error al actualizar proveedor");
  return result.data || result.proveedor || result;
}

export async function eliminarProveedor(id) {
  await csrfCookie();
  const res = await apiFetch(`/proveedores/${id}`, {
    method: "DELETE",
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result?.message || "No se pudo eliminar");
  return result;
}

export function importarProveedores(file, { onUploadProgress, onProcessing } = {}) {
  return uploadWithProgress("/proveedores/importar", file, { onUploadProgress, onProcessing });
}

export async function toggleProveedor(id) {
  await csrfCookie();
  const res = await apiFetch(`/proveedores/${id}/toggle`, {
    method: "PATCH",
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result?.message || "Error al cambiar estado");
  return result;
}
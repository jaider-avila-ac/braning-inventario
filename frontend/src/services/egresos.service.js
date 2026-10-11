// src/services/egresos.service.js
import { apiFetch, csrfCookie } from "./api";
import { API_BASE_URL, TOKEN_KEY } from "../config/config";

/**
 * GET /egresos/unificados
 * Listar egresos unificados (manuales + compras)
 */
export async function listarEgresos(params = {}) {
  const qs = new URLSearchParams();
  
  if (params.search) qs.append("search", params.search);
  if (params.tipo) qs.append("tipo", params.tipo);
  if (params.estado) qs.append("estado", params.estado);
  if (params.desde) qs.append("desde", params.desde);
  if (params.hasta) qs.append("hasta", params.hasta);
  if (params.per_page) qs.append("per_page", params.per_page);
  if (params.page) qs.append("page", params.page);
  
  const url = qs.toString() ? `/egresos/unificados?${qs}` : "/egresos/unificados";
  const res = await apiFetch(url);
  const data = await res.json();
  
  if (!res.ok) throw new Error(data?.message || "Error al listar egresos");
  return data;
}

/**
 * POST /egresos/manuales
 * Crear un nuevo egreso manual (con o sin archivo)
 * IMPORTANTE: Para FormData NO podemos usar apiFetch porque fuerza Content-Type: application/json
 */
export async function crearEgreso(descripcion, monto, notas = null, archivo = null) {
  await csrfCookie();
  
  const token = localStorage.getItem(TOKEN_KEY);
  const xsrf = getCookie("XSRF-TOKEN");
  
  if (archivo) {
    // Usar FormData para archivos
    const formData = new FormData();
    formData.append("descripcion", descripcion);
    formData.append("monto", monto);
    if (notas) formData.append("notas", notas);
    formData.append("archivo", archivo);
    
    const headers = {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
    };
    
    const res = await fetch(`${API_BASE_URL}/api/egresos/manuales`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers,
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al crear egreso");
    return data;
  } else {
    // Sin archivo, usar apiFetch normal
    const res = await apiFetch("/egresos/manuales", {
      method: "POST",
      body: JSON.stringify({
        descripcion: descripcion,
        monto: monto,
        notas: notas || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al crear egreso");
    return data;
  }
}

/**
 * PUT /egresos/manuales/{id}
 * Actualizar un egreso manual (con o sin archivo)
 */
export async function actualizarEgreso(id, descripcion, monto, notas = null, archivo = null) {
  await csrfCookie();
  
  const token = localStorage.getItem(TOKEN_KEY);
  const xsrf = getCookie("XSRF-TOKEN");
  
  if (archivo) {
    // Usar FormData con _method: PUT para Laravel
    const formData = new FormData();
    formData.append("descripcion", descripcion);
    formData.append("monto", monto);
    if (notas) formData.append("notas", notas);
    formData.append("archivo", archivo);
    formData.append("_method", "PUT");
    
    const headers = {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
    };
    
    const res = await fetch(`${API_BASE_URL}/api/egresos/manuales/${id}`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers,
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al actualizar egreso");
    return data;
  } else {
    // Sin archivo, usar apiFetch normal
    const res = await apiFetch(`/egresos/manuales/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        descripcion: descripcion,
        monto: monto,
        notas: notas || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al actualizar egreso");
    return data;
  }
}

/**
 * POST /egresos/manuales/{id}/anular
 * Anular un egreso manual
 */
export async function anularEgreso(id) {
  await csrfCookie();
  const res = await apiFetch(`/egresos/manuales/${id}/anular`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al anular egreso");
  return data;
}

// Helper para obtener cookie (igual que en api.js)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}
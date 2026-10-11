// src/services/ingresos.service.js
import { apiFetch, csrfCookie } from "./api";
import { API_BASE_URL, TOKEN_KEY } from "../config/config";

/**
 * GET /ingresos/unificados
 * Listar ingresos unificados (pagos, mostrador, manuales)
 */
export async function listarIngresos(params = {}) {
  const qs = new URLSearchParams();
  
  if (params.search) qs.append("search", params.search);
  if (params.tipo) qs.append("tipo", params.tipo);
  if (params.estado) qs.append("estado", params.estado);
  if (params.desde) qs.append("desde", params.desde);
  if (params.hasta) qs.append("hasta", params.hasta);
  if (params.per_page) qs.append("per_page", params.per_page);
  if (params.page) qs.append("page", params.page);
  
  const url = qs.toString() ? `/ingresos/unificados?${qs}` : "/ingresos/unificados";
  const res = await apiFetch(url);
  const data = await res.json();
  
  if (!res.ok) throw new Error(data?.message || "Error al listar ingresos");
  return data;
}

/**
 * POST /ingresos/manuales
 * Crear un nuevo ingreso manual (con o sin archivo)
 */
export async function crearIngreso(descripcion, monto, notas = null, archivo = null) {
  await csrfCookie();
  
  const token = localStorage.getItem(TOKEN_KEY);
  const xsrf = getCookie("XSRF-TOKEN");
  
  if (archivo) {
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
    
    const res = await fetch(`${API_BASE_URL}/api/ingresos/manuales`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers,
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al crear ingreso");
    return data;
  } else {
    const res = await apiFetch("/ingresos/manuales", {
      method: "POST",
      body: JSON.stringify({
        descripcion: descripcion,
        monto: monto,
        notas: notas || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al crear ingreso");
    return data;
  }
}

/**
 * PUT /ingresos/manuales/{id}
 * Actualizar un ingreso manual (con o sin archivo)
 */
export async function actualizarIngreso(id, descripcion, monto, notas = null, archivo = null) {
  await csrfCookie();
  
  const token = localStorage.getItem(TOKEN_KEY);
  const xsrf = getCookie("XSRF-TOKEN");
  
  if (archivo) {
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
    
    const res = await fetch(`${API_BASE_URL}/api/ingresos/manuales/${id}`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers,
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al actualizar ingreso");
    return data;
  } else {
    const res = await apiFetch(`/ingresos/manuales/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        descripcion: descripcion,
        monto: monto,
        notas: notas || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al actualizar ingreso");
    return data;
  }
}

/**
 * POST /ingresos/manuales/{id}/anular
 * Anular un ingreso manual
 */
export async function anularIngreso(id) {
  await csrfCookie();
  const res = await apiFetch(`/ingresos/manuales/${id}/anular`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al anular ingreso");
  return data;
}

/**
 * POST /pagos/{id}/anular
 * Anular un pago de factura desde el listado unificado
 */
export async function anularPagoFactura(id) {
  await csrfCookie();
  const res = await apiFetch(`/pagos/${id}/anular`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al anular pago");
  return data;
}

/**
 * POST /ingresos/mostrador/{id}/anular
 * Anular una venta mostrador (venta rápida)
 */
export async function anularVentaMostrador(id) {
  await csrfCookie();
  const res = await apiFetch(`/ingresos/mostrador/${id}/anular`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al anular venta");
  return data;
}

// Helper para obtener cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}
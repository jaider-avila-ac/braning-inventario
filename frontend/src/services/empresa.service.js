// src/services/empresa.service.js
import { apiFetch, csrfCookie } from "./api";
import { API_BASE_URL } from "../config/config";

// Helper para obtener cookie XSRF (misma lógica que apiFetch)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}

/**
 * Obtiene los datos de la empresa actual (EMPRESA_ADMIN)
 * GET /api/empresa/me
 */
export async function obtenerEmpresa() {
  const res = await apiFetch("/empresa/me");
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar datos de la empresa");
  return data.empresa ?? data;
}

/**
 * Actualiza los datos de la empresa
 * PUT /api/empresas/{id}
 */
export async function actualizarEmpresa(id, payload) {
  await csrfCookie();
  const res = await apiFetch(`/empresas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al actualizar empresa");
  return data.empresa ?? data;
}

/**
 * Subir logo de la empresa
 * POST /api/empresas/{id}/logo
 */
export async function subirLogo(id, file) {
  await csrfCookie();

  const formData = new FormData();
  formData.append("logo", file);

  const headers = {};
  const xsrf = getCookie("XSRF-TOKEN");
  if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

  const token = localStorage.getItem("access_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${API_BASE_URL}/api/empresas/${id}/logo`;

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers,
    credentials: "include",
  });

  // Mejor manejo de errores
  const textResponse = await res.text();
  let data;
  try {
    data = JSON.parse(textResponse);
  } catch {
    console.error("Respuesta no JSON:", textResponse.substring(0, 200));
    throw new Error(`Error del servidor: ${res.status}`);
  }

  if (!res.ok) throw new Error(data?.message || "Error al subir el logo");
  return data.empresa ?? data;
}

/**
 * Eliminar logo de la empresa
 * DELETE /api/empresas/{id}/logo
 */
export async function eliminarLogo(id) {
  await csrfCookie();
  const res = await apiFetch(`/empresas/${id}/logo`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al eliminar el logo");
  return data.empresa ?? data;
}

/**
 * Obtener la URL del logo con autenticación (para usar en <img>)
 * Esta función obtiene el blob de la imagen y crea una URL local
 */
export async function obtenerLogoUrl() {
  const token = localStorage.getItem("access_token");
  
  // Agregar timestamp para evitar caché
  const timestamp = Date.now();
  
  const url = `${API_BASE_URL}/api/empresa/logo?t=${timestamp}`;
  
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "image/*",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al cargar el logo");
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * Guardar tema de presentación de documentos
 * PUT /api/empresa/tema
 */
export async function guardarTema(docTema, docColor) {
  await csrfCookie();
  const res = await apiFetch("/empresa/tema", {
    method: "PUT",
    body: JSON.stringify({ doc_tema: docTema, doc_color: docColor }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al guardar el tema");
  return data.empresa ?? data;
}

/**
 * Revocar URL de blob (para liberar memoria)
 */
export function revocarLogoUrl(url) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
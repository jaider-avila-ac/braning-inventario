// src/services/brevo.service.js
import { apiFetch, csrfCookie } from "./api";

/**
 * Obtener configuración de Brevo
 */
export async function getBrevoConfig() {
  const res = await apiFetch("/brevo/config");
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar configuración de Brevo");
  return data.config;
}

/**
 * Guardar configuración de Brevo
 */
export async function saveBrevoConfig(payload) {
  await csrfCookie();
  const res = await apiFetch("/brevo/config", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al guardar configuración");
  return data;
}

/**
 * Enviar email de prueba
 */
export async function sendTestEmail(email) {
  await csrfCookie();
  const res = await apiFetch("/brevo/test", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al enviar email de prueba");
  return data;
}
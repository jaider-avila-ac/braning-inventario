import { apiFetch, csrfCookie } from "./api";
import { USER_KEY, TOKEN_KEY } from "../config/config";
import { clearAllPageCache } from "../utils/pageCache";

export async function login(email, password) {
  await csrfCookie();
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Credenciales inválidas.");
  const userData = data.usuario || data.user;
  if (!userData) throw new Error("Error al obtener datos del usuario.");
  return { token: data.access_token, usuario: userData };
}

export async function obtenerPerfil() {
  try {
    const res = await apiFetch("/auth/me");
    if (!res.ok) throw new Error("Error al obtener perfil");
    return res.json();
  } catch (error) {
    console.error("Error obtener perfil:", error);
    throw error;
  }
}

export async function cerrarSesionBackend() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || raw === "undefined" || raw === "null") return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (user.access_token) {
    localStorage.setItem(TOKEN_KEY, user.access_token);
  }
}

export function clearAuth() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  clearAllPageCache();
}

export function hasRole(...roles) {
  const u = getUser();
  return u ? roles.includes(u.rol) : false;
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return token;
  const u = getUser();
  return u?.access_token || null;
}

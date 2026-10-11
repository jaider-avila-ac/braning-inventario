import { API_BASE_URL, TOKEN_KEY, USER_KEY } from "../config/config";

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function setApiToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}

function getAccessToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return token;
  
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;
  try {
    const parsed = JSON.parse(user);
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers || {}),
  };

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const xsrf = getCookie("XSRF-TOKEN");
  if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

  const p = path.startsWith("/") ? path : `/${path}`;
  
const response = await fetch(`${API_BASE_URL}/api${p}`, {
    ...options,
    headers,
    credentials: "include",
  });
  
  if (response.status === 401 && unauthorizedHandler && !path.includes("/auth/")) {
    console.warn("⚠️ 401 Unauthorized en:", path);
    unauthorizedHandler();
  }
  
  return response;
}

export async function csrfCookie() {
  const response = await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });
  return response;
}

export function uploadWithProgress(path, file, { onUploadProgress, onProcessing } = {}) {
  return new Promise((resolve, reject) => {
    const token = getAccessToken();
    const xsrf = getCookie("XSRF-TOKEN");

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onUploadProgress?.(pct);
        if (pct === 100) onProcessing?.();
      }
    };

    xhr.onload = () => {
      let data;
      try { data = JSON.parse(xhr.responseText); } catch { data = { message: "Respuesta inválida del servidor" }; }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject({ status: xhr.status, data });
      }
    };

    xhr.onerror = () => reject({ status: 0, data: { message: "Error de conexión" } });
    xhr.ontimeout = () => reject({ status: 0, data: { message: "Tiempo de espera agotado" } });

    const p = path.startsWith("/") ? path : `/${path}`;
    xhr.open("POST", `${API_BASE_URL}/api${p}`);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Accept", "application/json");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    if (xsrf) xhr.setRequestHeader("X-XSRF-TOKEN", xsrf);

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}
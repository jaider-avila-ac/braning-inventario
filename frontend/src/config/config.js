// Configuración de la app
// Usar cadena vacía porque el proxy de Vite redirige /api a localhost:8000

//config/config.js
export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const USER_KEY = "user";
export const TOKEN_KEY = "access_token";
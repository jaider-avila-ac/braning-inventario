import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

const PING_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos

export function useSessionPing() {
  const { token, logout } = useAuth();

  useEffect(() => {
    if (!token) return;

    const ping = async () => {
      try {
        const res = await apiFetch("/auth/ping");
        // /auth/* está excluido del handler automático de apiFetch,
        // así que manejamos el 401 aquí explícitamente
        if (res.status === 401) {
          logout();
        }
      } catch {
        // Error de red — no cerrar sesión, puede ser temporal
      }
    };

    // Ping inmediato al montar (verifica que la sesión siga viva)
    ping();

    const id = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(id);
  }, [token, logout]);
}

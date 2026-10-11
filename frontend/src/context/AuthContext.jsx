import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {  TOKEN_KEY } from "../config/config";
import { setApiToken, setUnauthorizedHandler } from "../services/api";
import { obtenerPerfil, cerrarSesionBackend, getUser, clearAuth } from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [perfil, setPerfil] = useState(() => getUser());
  // true solo cuando hay token pero aún no hay perfil en caché → necesita fetch
  const [loadingPerfil, setLoadingPerfil] = useState(
    () => !!localStorage.getItem(TOKEN_KEY) && !getUser()
  );

  const logout = useCallback(async () => {
    try { await cerrarSesionBackend(); } catch { /* ignorar */ }
    clearAuth();
    setToken(null);
    setPerfil(null);
    setApiToken(null);
    setLoadingPerfil(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    setApiToken(token);
  }, [token]);

  // Sin setState sincrónico en el cuerpo del efecto:
  // - early returns sin setState (token/perfil ya cubren esos casos)
  // - setState solo dentro de callbacks .then()/.finally()
  useEffect(() => {
    if (!token || perfil) return;
    obtenerPerfil()
      .then(perfilData => setPerfil(perfilData))
      .catch(() => logout())
      .finally(() => setLoadingPerfil(false));
  }, [token, perfil, logout]);

  const login = useCallback((jwt, usuario) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    setToken(jwt);
    setPerfil(usuario);
    setLoadingPerfil(false);
  }, []);

  return (
    <AuthContext.Provider value={{ token, perfil, loadingPerfil, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

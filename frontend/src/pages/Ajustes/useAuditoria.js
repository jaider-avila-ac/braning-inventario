// src/pages/Ajustes/useAuditoria.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { activosAhora, getAuditoria } from "../../services/usuarios.service";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../utils/notifications";

const ACCION_BADGE = {
  LOGIN: "bg-green-100 text-green-700 border-green-200",
  LOGOUT: "bg-gray-100 text-gray-700 border-gray-200",
  CREAR: "bg-blue-100 text-blue-700 border-blue-200",
  EDITAR: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ELIMINAR: "bg-red-100 text-red-700 border-red-200",
  TOGGLE: "bg-indigo-100 text-indigo-700 border-indigo-200",
  CAMBIO_CLAVE: "bg-orange-100 text-orange-700 border-orange-200",
};

const getAccionBadge = (accion) => {
  const className = ACCION_BADGE[accion] || "bg-gray-100 text-gray-700 border-gray-200";
  return className;
};

export function useAuditoria() {
  const { perfil } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const usuarioIdParam = searchParams.get("usuario_id") || "";
  
  const isSA = perfil?.rol === "SUPER_ADMIN";
  const isEmpresaAdmin = perfil?.rol === "EMPRESA_ADMIN";

  // Estados para auditoría
  const [auditoria, setAuditoria] = useState([]);
  const [auditoriaLoading, setAuditoriaLoading] = useState(false);
  const [auditoriaPagination, setAuditoriaPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });
  const [filtroUsuarioId, setFiltroUsuarioId] = useState(usuarioIdParam);
  const [filtroAccion, setFiltroAccion] = useState("");
  const [filtroDesde, setFiltroDesde] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  });
  const [filtroHasta, setFiltroHasta] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Estados para sesiones
  const [sesiones, setSesiones] = useState([]);
  const [sesionesLoading, setSesionesLoading] = useState(false);
  const [sesionesPagination, setSesionesPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });
  const [sesionesUsuarioId, setSesionesUsuarioId] = useState(usuarioIdParam);

  // Estados para usuarios activos
  const [activos, setActivos] = useState([]);
  const [activosLoading, setActivosLoading] = useState(false);
  const [minutos, setMinutos] = useState("30");

  const auditoriaPageRef = useRef(1);
  const sesionesPageRef = useRef(1);

  // Cargar auditoría
  const loadAuditoria = useCallback(async (page = 1) => {
    auditoriaPageRef.current = page;
    setAuditoriaLoading(true);
    try {
      let data;
      if (filtroUsuarioId) {
        // Auditoría específica de un usuario
        data = await getAuditoria(filtroUsuarioId, { tipo: "por", page });
      } else {
        // Auditoría general con filtros
        const params = new URLSearchParams();
        params.append("page", page);
        if (filtroAccion) params.append("accion", filtroAccion);
        if (filtroDesde) params.append("desde", filtroDesde);
        if (filtroHasta) params.append("hasta", filtroHasta);
        const res = await apiFetch(`/auditoria?${params}`);
        data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Error al cargar auditoría");
      }
      setAuditoria(data.data || []);
      setAuditoriaPagination({
        currentPage: data.current_page || 1,
        lastPage: data.last_page || 1,
        total: data.total || 0,
        perPage: data.per_page || 10,
      });
    } catch (error) {
      console.error("Error loading auditoria:", error);
      showToast(error.message || "Error al cargar auditoría", "error");
    } finally {
      setAuditoriaLoading(false);
    }
  }, [filtroUsuarioId, filtroAccion, filtroDesde, filtroHasta]);

  // Cargar sesiones de un usuario
  const loadSesiones = useCallback(async (userId, page = 1) => {
    if (!userId) {
      setSesiones([]);
      setSesionesPagination({ currentPage: 1, lastPage: 1, total: 0 });
      return;
    }
    sesionesPageRef.current = page;
    setSesionesLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (filtroDesde) params.append("desde", filtroDesde);
      if (filtroHasta) params.append("hasta", filtroHasta);
      const res = await apiFetch(`/usuarios/${userId}/sesiones?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error al cargar sesiones");
      setSesiones(data.data || []);
      setSesionesPagination({
        currentPage: data.current_page || 1,
        lastPage: data.last_page || 1,
        total: data.total || 0,
      });
    } catch (error) {
      console.error("Error loading sesiones:", error);
      showToast(error.message || "Error al cargar sesiones", "error");
    } finally {
      setSesionesLoading(false);
    }
  }, [filtroDesde, filtroHasta]);

  // Cargar usuarios activos
  const loadActivos = useCallback(async () => {
    setActivosLoading(true);
    try {
      const res = await activosAhora(parseInt(minutos, 10));
      setActivos(res.data || []);
    } catch (error) {
      console.error("Error loading activos:", error);
      setActivos([]);
    } finally {
      setActivosLoading(false);
    }
  }, [minutos]);

  // Cambiar página de auditoría
  const changeAuditoriaPage = (newPage) => {
    if (newPage >= 1 && newPage <= auditoriaPagination.lastPage) {
      loadAuditoria(newPage);
    }
  };

  // Cambiar página de sesiones
  const changeSesionesPage = (newPage) => {
    if (newPage >= 1 && newPage <= sesionesPagination.lastPage) {
      loadSesiones(sesionesUsuarioId, newPage);
    }
  };

  // Buscar
  const handleBuscar = () => {
    if (filtroUsuarioId !== sesionesUsuarioId) {
      setSesionesUsuarioId(filtroUsuarioId);
    }
    loadAuditoria(1);
    if (filtroUsuarioId) {
      loadSesiones(filtroUsuarioId, 1);
    } else {
      setSesiones([]);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroUsuarioId("");
    setFiltroAccion("");
    setFiltroDesde(() => {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
    });
    setFiltroHasta(() => new Date().toISOString().split("T")[0]);
  };

  // Recargar activos
  const recargarActivos = () => {
    loadActivos();
  };

  // Inicializar datos
  useEffect(() => {
    loadAuditoria(1);
    loadActivos();
    if (usuarioIdParam) {
      loadSesiones(usuarioIdParam, 1);
    }
  }, []);

  // Efecto para cargar sesiones cuando cambia el usuario seleccionado
  useEffect(() => {
    if (sesionesUsuarioId && sesionesUsuarioId !== usuarioIdParam) {
      loadSesiones(sesionesUsuarioId, 1);
    }
  }, [sesionesUsuarioId]);

  const formatDateTime = (isoDate) => {
    if (!isoDate) return "—";
    return new Date(isoDate).toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const parseUserAgent = (ua) => {
    if (!ua) return { dispositivo: "—", browser: "—" };
    const dispositivo = ua.includes("Mobile") ? "Móvil" : "Escritorio";
    let browser = "Otro";
    if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    return { dispositivo, browser };
  };

  return {
    // Permisos
    isSA,
    isEmpresaAdmin,
    
    // Auditoría
    auditoria,
    auditoriaLoading,
    auditoriaPagination,
    filtroUsuarioId,
    setFiltroUsuarioId,
    filtroAccion,
    setFiltroAccion,
    filtroDesde,
    setFiltroDesde,
    filtroHasta,
    setFiltroHasta,
    loadAuditoria,
    changeAuditoriaPage,
    
    // Sesiones
    sesiones,
    sesionesLoading,
    sesionesPagination,
    sesionesUsuarioId,
    loadSesiones,
    changeSesionesPage,
    
    // Activos
    activos,
    activosLoading,
    minutos,
    setMinutos,
    loadActivos,
    recargarActivos,
    
    // Acciones
    handleBuscar,
    limpiarFiltros,
    
    // Helpers
    formatDateTime,
    parseUserAgent,
    getAccionBadge,
  };
}
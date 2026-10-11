import { useState, useEffect, useCallback, useRef } from "react";
import {
  listarCotizaciones,
  eliminarCotizacion,
  emitirCotizacion,
  anularCotizacion,
} from "../services/cotizaciones.service";
import { showToast, showConfirm } from "../utils/notifications";

export function useCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });
  
  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const perPageRef = useRef(10); // Usamos ref para evitar dependencia

  // Cargar cotizaciones con paginación
  const loadCotizaciones = useCallback(async (page = 1) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listarCotizaciones({ 
        search, 
        estado, 
        page, 
        perPage: perPageRef.current 
      });
      
      if (isMountedRef.current) {
        setCotizaciones(data.data || []);
        setPagination({
          currentPage: data.current_page || 1,
          lastPage: data.last_page || 1,
          total: data.total || 0,
          perPage: data.per_page || 10,
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
        showToast(err.message, "error");
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [search, estado]); // ✅ Sin pagination.perPage como dependencia

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      loadCotizaciones(1);
    }, 300);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, estado, loadCotizaciones]);

  // Limpiar al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Carga inicial - ✅ con dependencia correcta
  useEffect(() => {
    loadCotizaciones(1);
  }, [loadCotizaciones]);

  // Cambiar página
  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      loadCotizaciones(newPage);
    }
  }, [pagination.lastPage, loadCotizaciones]);

  const handleDelete = useCallback(async (id) => {
    const confirmed = await showConfirm("¿Eliminar esta cotización? Esta acción no se puede deshacer.", {
      title: "Eliminar cotización",
      okLabel: "Sí, eliminar",
    });
    if (!confirmed || !isMountedRef.current) return;
    try {
      await eliminarCotizacion(id);
      showToast("Cotización eliminada", "success");
      loadCotizaciones(pagination.currentPage);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [loadCotizaciones, pagination.currentPage]);

  const handleEmitir = useCallback(async (id) => {
    const confirmed = await showConfirm("¿Emitir esta cotización? Se le asignará un número y no podrá editarse.", {
      title: "Emitir cotización",
      okLabel: "Sí, emitir",
    });
    if (!confirmed || !isMountedRef.current) return;
    try {
      await emitirCotizacion(id);
      showToast("Cotización emitida", "success");
      loadCotizaciones(pagination.currentPage);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [loadCotizaciones, pagination.currentPage]);

  const handleAnular = useCallback(async (id) => {
    const confirmed = await showConfirm("¿Anular esta cotización? Esta acción no se puede deshacer.", {
      title: "Anular cotización",
      okLabel: "Sí, anular",
    });
    if (!confirmed || !isMountedRef.current) return;
    try {
      await anularCotizacion(id);
      showToast("Cotización anulada", "success");
      loadCotizaciones(pagination.currentPage);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [loadCotizaciones, pagination.currentPage]);

  const reload = useCallback(() => {
    loadCotizaciones(pagination.currentPage);
  }, [loadCotizaciones, pagination.currentPage]);

  return {
    cotizaciones,
    loading,
    error,
    pagination,
    search,
    setSearch,
    estado,
    setEstado,
    handleDelete,
    handleEmitir,
    handleAnular,
    changePage,
    reload,
  };
}
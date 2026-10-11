import { useState, useEffect, useCallback, useRef } from "react";
import { listarProveedores, eliminarProveedor } from "../../services/proveedores.service";
import { showToast, showConfirm } from "../../utils/notifications";

export function useProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activos, setActivos] = useState("1");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });
  
  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const perPageRef = useRef(10);

  const loadProveedores = useCallback(async (page = 1) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listarProveedores({ 
        search, 
        activos, 
        page, 
        perPage: perPageRef.current 
      });
      
      if (isMountedRef.current) {
        setProveedores(data.data || []);
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
  }, [search, activos]);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      loadProveedores(1);
    }, 300);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, activos, loadProveedores]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadProveedores(1);
  }, [loadProveedores]);

  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      loadProveedores(newPage);
    }
  }, [pagination.lastPage, loadProveedores]);

  const handleDelete = useCallback(async (id, nombre) => {
    const confirmed = await showConfirm(`¿Eliminar el proveedor <strong>${nombre}</strong>?`, {
      title: "Eliminar proveedor",
      okLabel: "Sí, eliminar",
    });
    if (!confirmed || !isMountedRef.current) return;
    try {
      await eliminarProveedor(id);
      showToast("Proveedor eliminado correctamente", "success");
      loadProveedores(pagination.currentPage);
      return { success: true };
    } catch (err) {
      showToast(err.message, "error");
      return { success: false, error: err.message };
    }
  }, [loadProveedores, pagination.currentPage]);

  const reload = useCallback(() => {
    loadProveedores(pagination.currentPage);
  }, [loadProveedores, pagination.currentPage]);

  return {
    proveedores,
    loading,
    error,
    pagination,
    search,
    setSearch,
    activos,
    setActivos,
    handleDelete,
    changePage,
    reload,
  };
}
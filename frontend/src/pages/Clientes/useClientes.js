import { useState, useEffect, useCallback, useRef } from "react";
import { listarClientes, eliminarCliente } from "../../services/clientes.service";
import { showToast } from "../../utils/notifications";

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });
  
  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cargar clientes con paginación
  const loadClientes = useCallback(async (page = 1) => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      const data = await listarClientes({ 
        search, 
        page, 
        perPage: pagination.perPage 
      });
      
      if (isMountedRef.current) {
        setClientes(data.data || []);
        setPagination({
          currentPage: data.current_page || 1,
          lastPage: data.last_page || 1,
          total: data.total || 0,
          perPage: data.per_page || 10
        });
        setError(null);
      }
    } catch (err) {
      console.error("Error loading clientes:", err);
      if (isMountedRef.current) {
        setError(err.message || "Error al cargar clientes");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [search, pagination.perPage]);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      loadClientes(1);
    }, 300);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, loadClientes]);

  // Limpiar al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cambiar página
  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      loadClientes(newPage);
    }
  }, [pagination.lastPage, loadClientes]);

  // Eliminar cliente
  const handleDelete = async (id, nombre) => {
    try {
      await eliminarCliente(id);
      showToast(`Cliente "${nombre}" eliminado`, "success");
      loadClientes(pagination.currentPage);
      return { success: true };
    } catch (err) {
      showToast(`El cliente "${nombre}" no se puede eliminar porque tiene registros relacionados en el sistema.`, "warning");
      return { success: false, error: err.message };
    }
  };

  // Recargar
  const reload = useCallback(() => {
    loadClientes(pagination.currentPage);
  }, [loadClientes, pagination.currentPage]);

  return {
    clientes,
    loading,
    error,
    pagination,
    search,
    setSearch,
    handleDelete,
    changePage,
    reload
  };
}
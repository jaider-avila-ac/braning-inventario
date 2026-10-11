import { useState, useEffect, useCallback, useRef } from "react";
import { listarItems, eliminarItem } from "../../services/catalogo.service";
import { showToast, showConfirm } from "../../utils/notifications";

export function useCatalogo() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("");
  const [soloControla, setSoloControla] = useState("0");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });
  
  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const perPageRef = useRef(10);

  const loadItems = useCallback(async (page = 1) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listarItems({ 
        search, 
        tipo, 
        soloControla,
        page, 
        perPage: perPageRef.current 
      });
      
      if (isMountedRef.current) {
        setItems(data.data || []);
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
  }, [search, tipo, soloControla]);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      loadItems(1);
    }, 300);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, tipo, soloControla, loadItems]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadItems(1);
  }, [loadItems]);

  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      loadItems(newPage);
    }
  }, [pagination.lastPage, loadItems]);

  const handleDelete = useCallback(async (id, nombre) => {
    const confirmed = await showConfirm(
      `¿Eliminar <strong>${nombre}</strong>?<br><span style="font-size:0.85em;color:#6b7280">Si tiene compras asociadas, se anularán automáticamente y se revertirán los egresos y el inventario. Si fue usado en facturas activas, la operación será rechazada.</span>`,
      { title: "Eliminar ítem", okLabel: "Sí, eliminar" }
    );
    if (!confirmed || !isMountedRef.current) return;
    try {
      await eliminarItem(id);
      showToast("Item eliminado correctamente", "success");
      const targetPage = pagination.total - 1 <= (pagination.currentPage - 1) * pagination.perPage
        ? Math.max(1, pagination.currentPage - 1)
        : pagination.currentPage;
      loadItems(targetPage);
      return { success: true };
    } catch (err) {
      showToast(err.message, "error");
      return { success: false, error: err.message };
    }
  }, [loadItems, pagination.currentPage]);

  const reload = useCallback(() => {
    loadItems(pagination.currentPage);
  }, [loadItems, pagination.currentPage]);

  return {
    items,
    loading,
    error,
    pagination,
    search,
    setSearch,
    tipo,
    setTipo,
    soloControla,
    setSoloControla,
    handleDelete,
    changePage,
    reload,
  };
}
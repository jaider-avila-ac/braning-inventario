import { useState, useEffect, useCallback, useRef } from "react";
import { movimientosInventario } from "../../services/inventario.service";
import { showToast } from "../../utils/notifications";

export function useMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const loadMovimientos = useCallback(async (page = 1) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      // Ahora el servicio ya devuelve los datos parseados
      const data = await movimientosInventario({
        page,
        item_id: itemId,
        desde,
        hasta,
        per_page: 10,
      });
      
      if (isMountedRef.current) {
        setMovimientos(data.data || []);
        setPagination({
          currentPage: data.current_page || 1,
          lastPage: data.last_page || 1,
          total: data.total || 0,
          perPage: data.per_page || 10,
        });
      }
    } catch (error) {
      if (isMountedRef.current) showToast(error.message, "error");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [itemId, desde, hasta]);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => loadMovimientos(1), 300);
    return () => clearTimeout(debounceTimerRef.current);
  }, [itemId, desde, hasta, loadMovimientos]);

  // Solo gestiona el ref de montaje — la carga inicial la cubre el efecto de debounce
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      loadMovimientos(newPage);
    }
  }, [pagination.lastPage, loadMovimientos]);

  const reload = useCallback(() => {
    loadMovimientos(pagination.currentPage);
  }, [loadMovimientos, pagination.currentPage]);

  return {
    movimientos,
    loading,
    pagination,
    itemId,
    setItemId,
    desde,
    setDesde,
    hasta,
    setHasta,
    changePage,
    reload,
  };
}
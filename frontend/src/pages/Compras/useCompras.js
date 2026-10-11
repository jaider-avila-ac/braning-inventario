import { useState, useEffect, useCallback, useRef } from "react";
import {
  listarCompras,
  obtenerCompra,
  obtenerPagosDeCompra,
  confirmarCompra as confirmarCompraAPI,
  anularCompra as anularCompraAPI,
  registrarPagoCompra,
} from "../../services/compras.service";
import { showToast } from "../../utils/notifications";

export function useCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });
  const [compraActual, setCompraActual] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);

  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const loadCompras = useCallback(async (page = 1) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      const data = await listarCompras({ search, estado, desde: fechaDesde, hasta: fechaHasta, page, per_page: 10 });
      if (isMountedRef.current) {
        setCompras(data.data || []);
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
  }, [search, estado, fechaDesde, fechaHasta]);

  // Debounce para filtros — también cubre la carga inicial al montar
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => loadCompras(1), 300);
    return () => clearTimeout(debounceTimerRef.current);
  }, [search, estado, fechaDesde, fechaHasta, loadCompras]);

  // Solo gestiona el ref de montaje — sin loadCompras para evitar doble carga y setState en efecto
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) loadCompras(newPage);
  }, [pagination.lastPage, loadCompras]);

  // Carga compra + historial de pagos en paralelo
  const verDetalle = useCallback(async (id) => {
    try {
      const [compraData, pagosRaw] = await Promise.all([
        obtenerCompra(id),
        obtenerPagosDeCompra(id),
      ]);
      const pagos = Array.isArray(pagosRaw) ? pagosRaw : (pagosRaw?.data || []);
      setCompraActual({ ...compraData, pagos });
      setShowDetalleModal(true);
    } catch (error) {
      showToast(error.message, "error");
    }
  }, []);

  const abrirPago = useCallback((compra) => {
    setCompraActual(compra);
    setShowPagoModal(true);
  }, []);

  const registrarPago = useCallback(async (id, pagoData) => {
    try {
      await registrarPagoCompra(id, {
        fecha: pagoData.fecha,
        monto: pagoData.monto,
        medio_pago: pagoData.medio_pago,
        notas: pagoData.notas,
      });
      showToast("Pago registrado correctamente", "success");
      setShowPagoModal(false);
      loadCompras(pagination.currentPage);
      // Actualizar detalle si sigue abierto para la misma compra
      if (compraActual?.id === id) {
        const [nuevaCompra, nuevosPagosRaw] = await Promise.all([
          obtenerCompra(id),
          obtenerPagosDeCompra(id),
        ]);
        const pagos = Array.isArray(nuevosPagosRaw) ? nuevosPagosRaw : (nuevosPagosRaw?.data || []);
        setCompraActual({ ...nuevaCompra, pagos });
      }
    } catch (error) {
      showToast(error.message, "error");
      throw error;
    }
  }, [pagination.currentPage, loadCompras, compraActual]);

  // Nombres internos distintos para no tapar los imports del servicio
  const confirmarCompra = useCallback(async (id) => {
    try {
      await confirmarCompraAPI(id);
      showToast("Compra confirmada", "success");
      loadCompras(pagination.currentPage);
      setShowDetalleModal(false);
    } catch (error) {
      showToast(error.message, "error");
    }
  }, [pagination.currentPage, loadCompras]);

  const anularCompra = useCallback(async (id) => {
    try {
      await anularCompraAPI(id);
      showToast("Compra anulada", "success");
      loadCompras(pagination.currentPage);
      setShowDetalleModal(false);
    } catch (error) {
      showToast(error.message, "error");
    }
  }, [pagination.currentPage, loadCompras]);

  return {
    compras,
    loading,
    pagination,
    search,
    setSearch,
    estado,
    setEstado,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    changePage,
    verDetalle,
    abrirPago,
    registrarPago,
    confirmarCompra,
    anularCompra,
    compraActual,
    showDetalleModal,
    setShowDetalleModal,
    showPagoModal,
    setShowPagoModal,
  };
}

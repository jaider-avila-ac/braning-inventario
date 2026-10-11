// src/pages/Finanzas/useEgresos.js
import { useState, useCallback, useRef, useEffect } from "react";
import { listarEgresos, anularEgreso } from "../../services/egresos.service";
import { showToast } from "../../utils/notifications";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

export function useEgresos() {
  const [egresos, setEgresos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [filtros, setFiltros] = useState({
    search: "",
    tipo: "",
    estado: "ACTIVO",
    desde: "",
    hasta: "",
  });
  
  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cargar egresos usando el servicio
  const loadEgresos = useCallback(async (page = 1) => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      const response = await listarEgresos({
        search: filtros.search,
        tipo: filtros.tipo,
        estado: filtros.estado,
        desde: filtros.desde,
        hasta: filtros.hasta,
        per_page: pagination.per_page,
        page: page,
      });
      
      const rows = response.data || [];

      let totalSum = 0;
      const egresosData = rows.map(item => {
        totalSum += parseFloat(item.monto) || 0;
        return {
          id: item.id,
          recibo: item.recibo || `EG-${item.id}`,
          fecha: item.fecha || "—",
          descripcion: item.descripcion || "—",
          notas: item.notas || "—",
          monto: parseFloat(item.monto) || 0,
          monto_formatted: formatMoney(item.monto),
          estado: item.estado || "ACTIVO",
          tipo: item.tipo,
          tipo_label: item.tipo_label || (item.tipo === "EGRESO_COMPRA" ? "Compra" : "Manual"),
          tipo_icono: item.tipo_icono,
          archivo_url: item.archivo_url,
          archivo_nombre: item.archivo_nombre,
          proveedor_nombre: item.proveedor_nombre,
          created_at: item.created_at,
          updated_at: item.updated_at,
          usuario: item.usuario,
          anulado_por: item.anulado_por,
        };
      });

      if (isMountedRef.current) {
        setEgresos(egresosData);
        setTotal(totalSum);
        setPagination({
          current_page: response.current_page || 1,
          last_page: response.last_page || 1,
          per_page: response.per_page || 10,
          total: response.total || 0,
        });
      }
    } catch (error) {
      console.error("Error loading egresos:", error);
      if (isMountedRef.current) {
        showToast(error.message || "Error al cargar egresos", "error");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [filtros, pagination.per_page]);

  // Función para anular un egreso
  const anularEgresoPorId = useCallback(async (id, descripcion) => {
    try {
      await anularEgreso(id);
      showToast(`Egreso "${descripcion}" anulado.`, "warning");
      await loadEgresos(pagination.current_page);
      return true;
    } catch (error) {
      showToast(error.message || "Error al anular egreso", "error");
      return false;
    }
  }, [loadEgresos, pagination.current_page]);

  // Cambiar página
  const cambiarPagina = useCallback((page) => {
    if (page >= 1 && page <= pagination.last_page) {
      loadEgresos(page);
    }
  }, [loadEgresos, pagination.last_page]);

  // Debounce unificado para todos los filtros — loadEgresos se llama dentro
  // del setTimeout (no sincrónicamente en el efecto), lo que satisface la regla
  // del compilador de React sobre setState síncrono en efectos.
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      loadEgresos(1);
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [filtros, loadEgresos]);

  // Limpiar al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const actualizarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      search: "",
      tipo: "",
      estado: "ACTIVO",
      desde: "",
      hasta: "",
    });
  }, []);

  const recargar = useCallback(() => {
    loadEgresos(pagination.current_page);
  }, [loadEgresos, pagination.current_page]);

  return {
    egresos,
    loading,
    total,
    totalFormatted: formatMoney(total),
    pagination,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    recargar,
    cambiarPagina,
    anularEgreso: anularEgresoPorId,
    formatMoney,
  };
}
// src/pages/Finanzas/useIngresos.js
import { useState, useCallback, useRef, useEffect } from "react";
import { listarIngresos, anularIngreso, anularVentaMostrador, anularPagoFactura } from "../../services/ingresos.service";
import { showToast } from "../../utils/notifications";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (isoDate) => {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

export function useIngresos(initialTipo = "") {
  const [ingresos, setIngresos] = useState([]);
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
    tipo: initialTipo,
    estado: "ACTIVO",
    desde: "",
    hasta: "",
  });
  
  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const loadIngresos = useCallback(async (page = 1) => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      const response = await listarIngresos({
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
      const ingresosData = rows.map(item => {
        if (item.estado !== 'ANULADO') totalSum += parseFloat(item.monto) || 0;
        return {
          id: item.id,
          recibo: item.recibo || `ING-${item.id}`,
          fecha: item.fecha,
          fecha_formatted: formatDate(item.fecha),
          tipo: item.tipo,
          tipo_label: item.tipo_label,
          descripcion: item.descripcion || "",
          monto: parseFloat(item.monto) || 0,
          monto_formatted: formatMoney(item.monto),
          forma_pago: item.forma_pago || "—",
          referencia: item.referencia || "—",
          notas: item.notas || "—",
          cliente_nombre: item.cliente_nombre,
          estado: item.estado || "ACTIVO",
          usuario: item.usuario,
          anulado_por: item.anulado_por,
        };
      });

      if (isMountedRef.current) {
        setIngresos(ingresosData);
        setTotal(totalSum);
        setPagination({
          current_page: response.current_page || 1,
          last_page: response.last_page || 1,
          per_page: response.per_page || 10,
          total: response.total || 0,
        });
      }
    } catch (error) {
      console.error("Error loading ingresos:", error);
      if (isMountedRef.current) {
        showToast(error.message || "Error al cargar ingresos", "error");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [filtros, pagination.per_page]);

  const anularIngresoPorId = useCallback(async (id, descripcion, tipo) => {
    try {
      if (tipo === "VENTA_MOSTRADOR") {
        await anularVentaMostrador(id);
      } else if (tipo === "PAGO_FACTURA") {
        await anularPagoFactura(id);
      } else {
        await anularIngreso(id);
      }
      showToast(`"${descripcion}" anulado.`, "warning");
      await loadIngresos(pagination.current_page);
      return true;
    } catch (error) {
      showToast(error.message || "Error al anular", "error");
      return false;
    }
  }, [loadIngresos, pagination.current_page]);

  const cambiarPagina = useCallback((page) => {
    if (page >= 1 && page <= pagination.last_page) {
      loadIngresos(page);
    }
  }, [loadIngresos, pagination.last_page]);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      loadIngresos(1);
    }, 300);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filtros.search, loadIngresos]);

  // Cargar cuando cambien otros filtros
  useEffect(() => {
    loadIngresos(1);
  }, [filtros.tipo, filtros.estado, filtros.desde, filtros.hasta, loadIngresos]);

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
    loadIngresos(pagination.current_page);
  }, [loadIngresos, pagination.current_page]);

  return {
    ingresos,
    loading,
    total,
    totalFormatted: formatMoney(total),
    pagination,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    recargar,
    cambiarPagina,
    anularIngreso: anularIngresoPorId,
    formatMoney,
    formatDate,
  };
}
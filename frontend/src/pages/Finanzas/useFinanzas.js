import { useState, useEffect, useCallback, useRef } from "react";
import { getResumen, facturasPendientes } from "../../services/finanzas.service";
import { getCached, setCached } from "../../utils/pageCache";

const CACHE_KEY = "finanzas";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const KPI_VACIO = {
  ingresos_facturas: 0,
  ingresos_mostrador: 0,
  ingresos_manuales: 0,
  total_en_caja: 0,
  egresos_compras: 0,
  egresos_manuales: 0,
  total_egresos: 0,
  balance_real: 0,
  saldo_pendiente: 0,
  cuentas_por_pagar: 0,
  pendientes_count: 0,
};

export function useFinanzas() {
  const cached = getCached(CACHE_KEY);

  const [kpis, setKpis] = useState(cached ?? KPI_VACIO);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [filtros, setFiltros] = useState({
    desde: `${new Date().getFullYear()}-01-01`,
    hasta: new Date().toISOString().split("T")[0],
  });
  const isFirstLoad = useRef(true);

  const cargarKpis = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const params = {};
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;
      const [resumen, pendData] = await Promise.all([
        getResumen(params),
        facturasPendientes(),
      ]);
      const pendCount = pendData.total ?? (Array.isArray(pendData.data) ? pendData.data.length : 0);
      const next = {
        ingresos_facturas: resumen.ingresos_facturas || 0,
        ingresos_mostrador: resumen.ingresos_mostrador || 0,
        ingresos_manuales: resumen.ingresos_manuales || 0,
        total_en_caja: resumen.total_en_caja || 0,
        egresos_compras: resumen.egresos_compras || 0,
        egresos_manuales: resumen.egresos_manuales || 0,
        total_egresos: resumen.total_egresos || 0,
        balance_real: resumen.balance_real || 0,
        saldo_pendiente: resumen.saldo_pendiente || 0,
        cuentas_por_pagar: resumen.cuentas_por_pagar || 0,
        pendientes_count: pendCount,
      };
      setKpis(next);
      setCached(CACHE_KEY, next);
    } catch (error) {
      console.error("Error cargando KPIs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtros]);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      // Primera carga: silenciosa si hay caché, normal si no
      cargarKpis(!!cached);
    } else {
      // Cambio de filtros: siempre silencioso (tiene datos previos en pantalla)
      cargarKpis(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  const limpiarFiltros = () => {
    setFiltros({ desde: "", hasta: "" });
  };

  return {
    kpis,
    loading,
    refreshing,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    recargar: () => cargarKpis(true),
    formatMoney,
  };
}

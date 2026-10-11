import { useState, useEffect, useCallback } from "react";
import { obtenerDashboard } from "../../services/dashboard.service";
import { getCached, setCached } from "../../utils/pageCache";

const CACHE_KEY = "dashboard";

const DASHBOARD_VACIO = {
  resumen: {
    total_clientes: 0,
    total_items: 0,
    cotizaciones_activas: 0,
    facturas_borrador: 0,
    facturas_emitidas: 0,
    total_en_caja: 0,
    balance_real: 0,
    total_pagado: 0,
    saldo_pendiente: 0,
    ingresos_hoy: 0,
  },
  ultimasFacturas: [],
  ultimosPagos: []
};

export function useDashboard() {
  const cached = getCached(CACHE_KEY);

  const [dashboardData, setDashboardData] = useState(cached ?? DASHBOARD_VACIO);
  // loading solo es true en la primera carga sin caché
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await obtenerDashboard();
      const next = {
        resumen: data.resumen || DASHBOARD_VACIO.resumen,
        ultimasFacturas: data.ultimasFacturas || [],
        ultimosPagos: data.ultimosPagos || [],
      };
      setDashboardData(next);
      setCached(CACHE_KEY, next);
    } catch {
      // Si hay caché, quedarse con él; si no, dejar vacío
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Si hay caché, cargar en segundo plano (silent); si no, carga normal
    loadDashboard(!!cached);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    dashboardData,
    loading,
    refreshing,
    reload: () => loadDashboard(true),
  };
}

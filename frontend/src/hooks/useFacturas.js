import { useState, useEffect, useCallback, useRef } from "react";
import { listarFacturas, emitirFactura, anularFactura } from "../services/facturas.service";
import { showToast, showConfirm } from "../utils/notifications";
import { getCached, setCached } from "../utils/pageCache";

const CACHE_KEY = "facturas";
const TOTALES_VACIO = {
  total_activas: 0,
  total_emitidas: 0,
  total_borrador: 0,
  total_saldo_pendiente: 0,
  total_pagado: 0,
};

export function useFacturas() {
  const cached = getCached(CACHE_KEY);

  const [facturas, setFacturas] = useState(cached?.facturas ?? []);
  const [totales, setTotales] = useState(cached?.totales ?? TOTALES_VACIO);
  // Solo muestra skeleton si no hay nada en caché
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const isMountedRef = useRef(true);
  const isFirstLoad = useRef(true);

  const loadFacturas = useCallback(async (silent = false) => {
    if (!isMountedRef.current) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await listarFacturas({ search, estado });
      if (isMountedRef.current) {
        const newFacturas = data.data || [];
        const newTotales = data.totales || TOTALES_VACIO;
        setFacturas(newFacturas);
        if (data.totales) setTotales(newTotales);
        // Solo guardar caché en la vista sin filtros
        if (!search && !estado) {
          setCached(CACHE_KEY, { facturas: newFacturas, totales: newTotales });
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
        showToast(err.message, "error");
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [search, estado]);

  useEffect(() => {
    isMountedRef.current = true;
    // Primera carga: silenciosa si hay caché (muestra caché + actualiza fondo)
    // Cambios de filtro: siempre silenciosos (ya hay datos en pantalla)
    const silent = isFirstLoad.current ? !!cached : true;
    if (isFirstLoad.current) isFirstLoad.current = false;
    const run = async () => { await loadFacturas(silent); };
    run();
    return () => { isMountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadFacturas]);

  const handleEmitir = useCallback(async (id) => {
    const confirmed = await showConfirm("¿Emitir esta factura? Se le asignará un número y no podrá editarse.", {
      title: "Emitir factura",
      okLabel: "Sí, emitir",
    });
    if (!confirmed || !isMountedRef.current) return;
    try {
      await emitirFactura(id);
      showToast("Factura emitida", "success");
      await loadFacturas(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [loadFacturas]);

  const handleAnular = useCallback(async (id) => {
    const confirmed = await showConfirm("¿Anular esta factura? Esta acción no se puede deshacer.", {
      title: "Anular factura",
      okLabel: "Sí, anular",
    });
    if (!confirmed || !isMountedRef.current) return;
    try {
      await anularFactura(id);
      showToast("Factura anulada", "success");
      await loadFacturas(true);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, [loadFacturas]);

  return {
    facturas, totales, loading, error,
    search, setSearch,
    estado, setEstado,
    handleEmitir, handleAnular,
    reload: () => loadFacturas(true),
  };
}

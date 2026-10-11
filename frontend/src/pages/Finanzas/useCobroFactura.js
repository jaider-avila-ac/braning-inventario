import { useState, useCallback } from "react";
import { buscarFacturaPorNumero } from "../../services/finanzas.service";

const num = (value) => parseFloat(value || 0);
const money = (value) => {
  if (value === undefined || value === null) return "$0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};

export function useCobroFactura() {
  const [cobroInput, setCobroInput] = useState("");
  const [cobroFactura, setCobroFactura] = useState(null);
  const [cobroMsg, setCobroMsg] = useState("");
  const [cobroMsgType, setCobroMsgType] = useState("muted"); // muted, danger, success
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // Limpiar todo el estado del cobro
  const limpiarCobro = useCallback(() => {
    setCobroInput("");
    setCobroFactura(null);
    setCobroMsg("");
    setCobroMsgType("muted");
    setShowResult(false);
    setLoading(false);
  }, []);

  // Renderizar el resultado de la factura encontrada
  const renderCobroResult = useCallback((fac) => {
    setCobroFactura(fac);
    setShowResult(true);
    setCobroMsg("");
    setCobroMsgType("muted");
  }, []);

  // Buscar factura por número
  const buscarCobro = useCallback(async () => {
    const val = cobroInput.trim();
    if (!val) return;

    setLoading(true);
    setCobroMsg("Buscando…");
    setCobroMsgType("muted");
    setShowResult(false);
    setCobroFactura(null);

    try {
      const fac = await buscarFacturaPorNumero(val);

      if (!fac) {
        setCobroMsg("Factura no encontrada o no está EMITIDA.");
        setCobroMsgType("danger");
        return;
      }

      if (num(fac.saldo) <= 0) {
        setCobroMsg(`La factura ${fac.numero} ya está pagada. ✓`);
        setCobroMsgType("success");
        return;
      }

      setCobroMsg("");
      renderCobroResult(fac);
    } catch (e) {
      setCobroMsg(e.message || "Error al buscar.");
      setCobroMsgType("danger");
    } finally {
      setLoading(false);
    }
  }, [cobroInput, renderCobroResult]);

  // Actualizar el estado después de un pago exitoso
  const actualizarCobroDespuesPago = useCallback(async () => {
    if (!cobroFactura?.numero) return;

    try {
      const fac2 = await buscarFacturaPorNumero(cobroFactura.numero);
      if (fac2 && num(fac2.saldo) > 0) {
        renderCobroResult(fac2);
      } else {
        limpiarCobro();
      }
    } catch (error) {
      console.error("Error al actualizar después de pago:", error);
    }
  }, [cobroFactura, renderCobroResult, limpiarCobro]);

  // Manejar tecla Enter en el input
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      buscarCobro();
    }
  }, [buscarCobro]);

  return {
    // Estado
    cobroInput,
    setCobroInput,
    cobroFactura,
    cobroMsg,
    cobroMsgType,
    showResult,
    loading,
    // Funciones
    buscarCobro,
    limpiarCobro,
    actualizarCobroDespuesPago,
    handleKeyDown,
    // Helpers
    money,
    num,
  };
}
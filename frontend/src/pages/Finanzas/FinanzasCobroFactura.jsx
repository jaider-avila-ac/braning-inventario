import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCobroFactura } from "./useCobroFactura";
import CobroModalUnificado from "../../components/ui/CobroModalUnificado";

export default function FinanzasCobroFactura() {
  const navigate  = useNavigate();
  const location  = useLocation();
  // location.key === "default" significa que llegó por URL directa (sin historial interno)
  const goBack = () => location.key !== "default" ? navigate(-1) : navigate("/dashboard");

  const {
    cobroInput,
    setCobroInput,
    cobroFactura,
    cobroMsg,
    cobroMsgType,
    showResult,
    loading,
    buscarCobro,
    limpiarCobro,
    actualizarCobroDespuesPago,
    handleKeyDown,
    money,
  } = useCobroFactura();

  const [showPagoModal, setShowPagoModal] = useState(false);

  const abrirModalPago = () => {
    if (!cobroFactura) return;
    setShowPagoModal(true);
  };

  const handlePagoOk = async () => {
    setShowPagoModal(false);
    await actualizarCobroDespuesPago();
  };

  // Obtener clase de mensaje según tipo
  const getMsgClass = () => {
    switch (cobroMsgType) {
      case "danger": return "bg-red-50 text-red-700 border border-red-200";
      case "success": return "bg-green-50 text-green-700 border border-green-200";
      default: return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 px-5 pt-5 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <i className="bi bi-arrow-left"></i>
              Volver
            </button>
          </div>
          <h5 className="text-lg font-semibold text-gray-800 mb-0 flex items-center gap-2">
            <i className="bi bi-search text-blue-500 text-xl"></i>
            Cobro rápido de facturas
          </h5>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Ingrese el número de factura para registrar un pago
          </p>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Barra de búsqueda */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número de factura (ej: FAC-001)"
                value={cobroInput}
                onChange={(e) => setCobroInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </div>
            <button
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={buscarCobro}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <i className="bi bi-search"></i>
                  Buscar
                </>
              )}
            </button>
            <button
              className="px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              onClick={limpiarCobro}
            >
              <i className="bi bi-x-lg"></i>
              Limpiar
            </button>
          </div>

          {/* Mensaje de búsqueda */}
          {cobroMsg && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${getMsgClass()}`}>
              <i className={`bi bi-${cobroMsgType === "danger" ? "exclamation-triangle" : cobroMsgType === "success" ? "check-circle" : "info-circle"} me-2`}></i>
              {cobroMsg}
            </div>
          )}

          {/* Resultado de la factura */}
          {showResult && cobroFactura && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Factura header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h5 className="text-md font-semibold text-gray-800 mb-0 flex items-center gap-2">
                    <i className="bi bi-receipt text-blue-500"></i>
                    Factura #{cobroFactura.numero}
                  </h5>
                  <a
                    href={`/facturas/${cobroFactura.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm no-underline flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver detalle <i className="bi bi-box-arrow-up-right text-xs"></i>
                  </a>
                </div>
              </div>

              {/* Factura body */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0">Cliente</p>
                    <p className="font-medium text-gray-800">
                      {cobroFactura.cliente?.nombre_razon_social || `Cliente ${cobroFactura.cliente_id}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0">Total factura</p>
                    <p className="text-xl font-bold text-blue-600">{money(cobroFactura.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0">Pagado</p>
                    <p className="font-semibold text-green-600">{money(cobroFactura.total_pagado)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0">Saldo pendiente</p>
                    <p className="text-xl font-bold text-red-600">{money(cobroFactura.saldo)}</p>
                  </div>
                </div>
              </div>

              {/* Factura footer */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <button
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  onClick={abrirModalPago}
                >
                  <i className="bi bi-cash-coin text-lg"></i>
                  Registrar pago
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de cobro unificado */}
      <CobroModalUnificado
        key={cobroFactura?.id ?? 0}
        isOpen={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        onPagoOk={handlePagoOk}
        factura={cobroFactura}
      />
    </div>
  );
}
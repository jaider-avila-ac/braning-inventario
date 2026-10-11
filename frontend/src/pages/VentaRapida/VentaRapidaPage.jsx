import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Ban } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import DataTable from "../../components/ui/DataTable";
import { useVentaRapida } from "./useVentaRapida";
import { buscarItems } from "../../services/ventaRapida.service";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const FORMA_PAGO_STYLES = {
  EFECTIVO: "bg-green-100 text-green-700",
  TRANSFERENCIA: "bg-blue-100 text-blue-700",
  TARJETA: "bg-purple-100 text-purple-700",
  BILLETERA: "bg-yellow-100 text-yellow-700",
  OTRO: "bg-gray-100 text-gray-700",
};

const HISTORIAL_COLUMNS = [
  { key: "item", label: "Item / Recibo" },
  { key: "cantidad", label: "Cant.", align: "right" },
  { key: "valor_unitario", label: "V. Unit.", align: "right" },
  { key: "forma_pago_badge", label: "Pago", align: "center" },
  { key: "total", label: "Total", align: "right" },
  { key: "vendedor", label: "Vendedor" },
  { key: "acciones", label: "", align: "center" },
];

const nombreUsuario = (u) => {
  if (!u) return null;
  return u.nombre_completo || [u.nombres, u.apellidos].filter(Boolean).join(" ").trim() || null;
};

export default function VentaRapidaPage() {
  const navigate = useNavigate();
  const {
    itemSeleccionado,
    setItemFromSearch,
    clearItem,
    cantidad,
    setCantidad,
    valorUnitario,
    setValorUnitario,
    formaPago,
    setFormaPago,
    referencia,
    setReferencia,
    historial,
    loading,
    registrando,
    kpis,
    fecha,
    setFecha,
    total,
    canSubmit,
    handleRegistrar,
    handleAnular,
  } = useVentaRapida();

  const itemInputRef = useRef(null);
  const itemDropdownRef = useRef(null);
  const itemTimerRef = useRef(null);

  const hideItems = () => {
    if (itemDropdownRef.current) {
      itemDropdownRef.current.style.display = "none";
    }
  };

  const showItems = (items) => {
    if (!itemDropdownRef.current) return;
    itemDropdownRef.current.innerHTML = "";
    if (!items.length) {
      const div = document.createElement("div");
      div.className = "px-3 py-2 text-gray-400 text-sm";
      div.textContent = "Sin resultados.";
      itemDropdownRef.current.appendChild(div);
    } else {
      items.forEach(item => {
        const div = document.createElement("div");
        div.className = "px-3 py-2 hover:bg-blue-50 cursor-pointer";
        const stockText = item.controla_inventario
          ? `Stock: ${item.cantidad_actual}`
          : "Sin control de stock";
        const precioText = item.precio_venta_sugerido > 0
          ? ` · ${formatMoney(item.precio_venta_sugerido)}`
          : "";
        div.innerHTML = `
          <div class="font-semibold text-sm">${item.nombre}</div>
          <div class="text-xs text-gray-500">${stockText}${precioText}</div>
        `;
        div.addEventListener("mousedown", (e) => {
          e.preventDefault();
          handleSelectItem(item);
        });
        itemDropdownRef.current.appendChild(div);
      });
    }
    itemDropdownRef.current.style.display = "block";
  };

  const handleSelectItem = (item) => {
    setItemFromSearch(item);
    hideItems();
    if (itemInputRef.current) {
      itemInputRef.current.value = item.nombre;
      itemInputRef.current.disabled = true;
    }
  };

  const handleClearItem = () => {
    clearItem();
    hideItems();
    if (itemInputRef.current) {
      itemInputRef.current.disabled = false;
      itemInputRef.current.value = "";
      itemInputRef.current.focus();
    }
  };

  const doSearch = async (search) => {
    try {
      const results = await buscarItems({ search });
      showItems(results);
    } catch (err) {
      console.error("Error buscando items:", err);
      showItems([]);
    }
  };

  const handleItemFocus = () => {
    if (itemInputRef.current?.disabled) return;
    doSearch("");
  };

  const handleItemInput = (e) => {
    if (itemInputRef.current?.disabled) return;
    const value = e.target.value;
    if (itemTimerRef.current) clearTimeout(itemTimerRef.current);
    itemTimerRef.current = setTimeout(() => doSearch(value), 200);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (itemInputRef.current && !itemInputRef.current.contains(e.target) &&
          itemDropdownRef.current && !itemDropdownRef.current.contains(e.target)) {
        hideItems();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const historialRows = historial.map(h => {
    const creador  = nombreUsuario(h.usuario);
    const anulador = nombreUsuario(h.anulado_por);
    return {
    item: (
      <div>
        <div className="font-semibold text-sm">{h.item_nombre || "—"}</div>
        <div className="text-xs text-gray-400">{h.numero_recibo}</div>
        {h.estado === "ANULADO" && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            <span className="text-xs text-red-500 font-medium">ANULADO</span>
            {anulador && <span className="text-xs text-gray-400">por: {anulador}</span>}
          </div>
        )}
      </div>
    ),
    cantidad: h.cantidad,
    valor_unitario: formatMoney(h.valor_unitario),
    forma_pago_badge: (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${FORMA_PAGO_STYLES[h.forma_pago] || "bg-gray-100 text-gray-700"}`}>
        {h.forma_pago || "—"}
      </span>
    ),
    total: (
      <span className={h.estado === "ANULADO" ? "line-through text-gray-400" : "text-green-600 font-semibold"}>
        {formatMoney(h.total_pagado)}
      </span>
    ),
    vendedor: creador
      ? <span className="text-xs text-gray-500 leading-tight">{creador}</span>
      : <span className="text-xs text-gray-300">—</span>,
    acciones: h.estado !== "ANULADO" ? (
      <IconButton
        icon={Ban}
        variant="danger"
        title="Anular venta"
        onClick={() => {
          if (window.confirm(`¿Anular la venta ${h.numero_recibo}?`)) {
            handleAnular(h.id);
          }
        }}
      />
    ) : null,
  };});

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Venta Rápida
          </h1>
          <p className="text-sm text-gray-400">Registra ventas sin factura — copias, impresiones, insumos pequeños</p>
        </div>
        <Button text="Volver" icon={ArrowLeft} variant="outline" onClick={() => navigate("/dashboard")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Formulario */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <i className="bi bi-search text-blue-500"></i> Buscar item
          </h3>

          {/* Búsqueda con ref — igual que proveedor en CatalogoFormPage */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={itemInputRef}
                type="text"
                onFocus={handleItemFocus}
                onChange={handleItemInput}
                placeholder="Buscar producto, insumo o servicio…"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${itemSeleccionado ? "bg-gray-100" : ""}`}
                disabled={!!itemSeleccionado}
                autoComplete="off"
              />
              <div
                ref={itemDropdownRef}
                className="absolute z-1050 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
                style={{ display: "none" }}
              />
            </div>
            {itemSeleccionado && (
              <button
                type="button"
                onClick={handleClearItem}
                className="text-xs text-blue-600 mt-1 hover:text-blue-700"
              >
                Cambiar item
              </button>
            )}
          </div>

          {itemSeleccionado && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex gap-2">
                <i className="bi bi-box-seam text-blue-500 mt-1"></i>
                <div className="flex-1">
                  <div className="font-semibold">{itemSeleccionado.nombre}</div>
                  <div className="text-sm text-gray-500">{itemSeleccionado.tipo || "—"}</div>
                  <div className="text-sm mt-1">
                    {itemSeleccionado.controla_inventario ? (
                      itemSeleccionado.cantidad_actual <= 0 ? (
                        <span className="text-red-600"><i className="bi bi-exclamation-triangle me-1"></i>Sin stock disponible</span>
                      ) : (
                        <span className="text-green-600"><i className="bi bi-check-circle me-1"></i>Disponible: {itemSeleccionado.cantidad_actual}</span>
                      )
                    ) : (
                      <span className="text-gray-500"><i className="bi bi-infinity me-1"></i>No controla inventario</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                disabled={!itemSeleccionado}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor unitario <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={valorUnitario}
                  onChange={(e) => setValorUnitario(e.target.value)}
                  disabled={!itemSeleccionado}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 mb-3 text-white">
            <div className="text-xs opacity-80 uppercase tracking-wide">Total a registrar</div>
            <div className="text-3xl font-bold">{formatMoney(total)}</div>
            {(parseFloat(cantidad) > 0 && parseFloat(valorUnitario) >= 0) && (
              <div className="text-xs opacity-75 mt-1">
                {cantidad} uds. × {formatMoney(parseFloat(valorUnitario) || 0)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pago <span className="text-red-500">*</span></label>
              <select
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar…</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="BILLETERA">Billetera/Nequi</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referencia <span className="text-gray-400 text-xs">(opcional)</span></label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="# transacción…"
                maxLength="120"
              />
            </div>
          </div>

          <button
            onClick={() => handleRegistrar(handleClearItem)}
            disabled={!canSubmit || registrando}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {registrando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Registrando...
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle"></i>
                Registrar venta
              </>
            )}
          </button>
        </div>

        {/* Historial */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <i className="bi bi-clock-history text-gray-500"></i> Ventas rápidas
            </h3>
            <div className="flex gap-2">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
              <button onClick={() => window.location.reload()} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-600">{formatMoney(kpis.total)}</div>
              <div className="text-xs text-gray-500">Total del día</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{kpis.count}</div>
              <div className="text-xs text-gray-500">Transacciones</div>
            </div>
          </div>

          <div className="overflow-auto" style={{ height: 400 }}>
            <DataTable
              columns={HISTORIAL_COLUMNS}
              rows={historialRows}
              loading={loading}
              empty="No hay ventas en esta fecha"
              pageSize={10}
              hidePagination={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

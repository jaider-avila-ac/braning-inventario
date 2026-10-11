import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, XCircle, Calendar, Receipt } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import SearchSelect from "../ui/SearchSelect";
import LineasTable from "./LineasTable";
import { apiFetch } from "../../services/api";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value || 0);

const CONFIG = {
  cotizacion: {
    tituloNuevo: "Nueva Cotización",
    tituloEdicion: (num) => `Cotización #${num}`,
    rutaLista: "/cotizaciones",
    hasFechaVencimiento: true,
    labelEmitir: "Emitir cotización",
  },
  factura: {
    tituloNuevo: "Nueva Factura",
    tituloEdicion: (num) => `Factura #${num}`,
    rutaLista: "/facturas",
    hasFechaVencimiento: false,
    labelEmitir: "Emitir factura",
  },
};

export default function DocumentoFormPage({
  modo,
  documentoId,
  numero,
  loading,
  saving,
  submitted = false,
  formData,
  totales,
  estado,
  isEditing,
  isEditable,
  guardar,
  emitir,
  anular,
  confirmarVigenciaCotizacion,
  convertir,
  updateCliente,
  updateField,
  addLinea,
  updateLinea,
  removeLinea,
}) {
  const navigate = useNavigate();
  const cfg = CONFIG[modo];

  // --- búsqueda asíncrona de clientes (backend) ---
  const searchClientes = useCallback(async (q) => {
    const qs = new URLSearchParams({ per_page: 80 });
    if (q) qs.set("search", q);
    const res = await apiFetch(`/clientes?${qs}`);
    const data = await res.json();
    return (data.data ?? []).map(c => ({ id: c.id, label: c.nombre_razon_social }));
  }, []);

  // --- búsqueda asíncrona de items (backend) ---
  const searchItems = useCallback(async (q) => {
    const qs = new URLSearchParams({ per_page: 80, activos: "1" });
    if (q) qs.set("search", q);
    const res = await apiFetch(`/items?${qs}`);
    const data = await res.json();
    return (data.data ?? []).map(it => ({
      id: it.id,
      label: it.nombre,
      precio: it.precio_venta_sugerido ?? null,
    }));
  }, []);

  // Fallback estático para mostrar el label del cliente ya seleccionado
  const selectedClientFallback = formData.cliente
    ? [{ id: formData.cliente.id, label: formData.cliente.nombre_razon_social ?? formData.cliente.nombre ?? "" }]
    : [];

  const handleClienteChange = (id) => {
    updateCliente(id ? { id } : null);
  };

  const handleClienteSelected = (item) => {
    if (item) updateCliente({ id: item.id, nombre_razon_social: item.label });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-2 text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? cfg.tituloEdicion(numero ?? documentoId) : cfg.tituloNuevo}
          </h1>
          {estado && (
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {estado}
            </span>
          )}
        </div>
        <Button text="Volver" icon={ArrowLeft} variant="outline" onClick={() => navigate(cfg.rutaLista)} />
      </div>

      {/* Datos generales */}
      <div className="bg-white rounded-xl border p-4 mb-4 shadow-sm">
        <div className={`grid grid-cols-1 gap-4 ${cfg.hasFechaVencimiento ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          <SearchSelect
            label="Cliente"
            required
            items={selectedClientFallback}
            onSearch={searchClientes}
            onSelectItem={handleClienteSelected}
            value={formData.cliente?.id ?? null}
            onChange={handleClienteChange}
            placeholder="Buscar cliente..."
            disabled={!isEditable}
          />
          <Input
            id="fecha"
            label="Fecha"
            type="date"
            value={formData.fecha}
            onChange={e => updateField("fecha", e.target.value)}
            disabled={!isEditable}
          />
          {cfg.hasFechaVencimiento && (
            <Input
              id="fecha_vencimiento"
              label="Vencimiento"
              type="date"
              value={formData.fecha_vencimiento}
              onChange={e => updateField("fecha_vencimiento", e.target.value)}
              disabled={!isEditable}
            />
          )}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={2}
            value={formData.notas}
            onChange={e => updateField("notas", e.target.value)}
            placeholder="Notas internas o términos..."
            disabled={!isEditable}
          />
        </div>
      </div>

      {/* Modo IVA */}
      <div className="bg-white rounded-xl border p-4 mb-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Configuración de IVA</p>
        <div className="flex flex-wrap items-center gap-6">
          {[
            { value: "global", label: "IVA global" },
            { value: "linea", label: "IVA por línea" },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="modoIva"
                value={value}
                checked={formData.modoIva === value}
                onChange={() => updateField("modoIva", value)}
                disabled={!isEditable}
                className="accent-blue-600 w-4 h-4"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
          {formData.modoIva === "global" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Porcentaje:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.ivaGlobal}
                onChange={e => updateField("ivaGlobal", Number(e.target.value))}
                disabled={!isEditable}
                className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
          )}
        </div>
      </div>

      {/* Ítems */}
      <LineasTable
        lineas={formData.lineas}
        modoIva={formData.modoIva}
        ivaGlobal={formData.ivaGlobal}
        onSearchItems={searchItems}
        onUpdate={updateLinea}
        onRemove={removeLinea}
        onAdd={addLinea}
        isEditable={isEditable}
        submitted={submitted}
      />

      {/* Totales */}
      <div className="bg-white rounded-xl border p-4 mb-4 shadow-sm flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span><span>{formatMoney(totales.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Descuentos:</span><span>- {formatMoney(totales.descuentos)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>IVA:</span><span>{formatMoney(totales.iva)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span><span>{formatMoney(totales.total)}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        {isEditable && (
          <Button text={saving ? "Guardando..." : "Guardar"} icon={Save} onClick={guardar} disabled={saving} />
        )}
        {isEditing && estado === "BORRADOR" && (
          <Button text={cfg.labelEmitir} icon={Send} variant="success" onClick={emitir} />
        )}
        {modo === "cotizacion" && isEditing && estado === "EMITIDA" && (
          <>
            <Button text="Extender vigencia" icon={Calendar} variant="warning" onClick={confirmarVigenciaCotizacion} />
            <Button text="Convertir a factura" icon={Receipt} variant="primary" onClick={convertir} />
          </>
        )}
        {isEditing && estado !== "ANULADA" && (
          <Button text="Anular" icon={XCircle} variant="danger" onClick={anular} />
        )}
      </div>
    </div>
  );
}

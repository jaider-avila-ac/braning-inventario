import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, XCircle, Calendar, Receipt, UserPlus } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import SearchSelect from "../ui/SearchSelect";
import LineasLibreTable from "./LineasLibreTable";
import ClienteRapidoModal from "./ClienteRapidoModal";
import { apiFetch } from "../../services/api";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value || 0);

const CONFIG = {
  cotizacion: {
    tituloNuevo: "Nueva Cotización Libre",
    tituloEdicion: (num) => `Cotización Libre #${num}`,
    rutaLista: "/cotizaciones",
    hasFechaVencimiento: true,
    labelEmitir: "Emitir cotización",
    labelDocumento: "cotización libre",
  },
  factura: {
    tituloNuevo: "Nueva Factura Libre",
    tituloEdicion: (num) => `Factura Libre #${num}`,
    rutaLista: "/facturas",
    hasFechaVencimiento: false,
    labelEmitir: "Emitir factura",
    labelDocumento: "factura libre",
  },
};

export default function DocumentoLibreFormPage({
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

  const [modalClienteOpen, setModalClienteOpen] = useState(false);

  const searchClientes = useCallback(async (q) => {
    const qs = new URLSearchParams({ per_page: 80 });
    if (q) qs.set("search", q);
    const res = await apiFetch(`/clientes?${qs}`);
    const data = await res.json();
    return (data.data ?? []).map(c => ({ id: c.id, label: c.nombre_razon_social }));
  }, []);

  const handleClienteChange = (id) => {
    updateCliente(id ? { id } : null);
  };

  const handleClienteSelected = (item) => {
    if (item) updateCliente({ id: item.id, nombre_razon_social: item.label });
  };

  const handleClienteCreado = (cliente) => {
    updateCliente(cliente);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditing ? cfg.tituloEdicion(numero ?? documentoId) : cfg.tituloNuevo}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200">
              LIBRE
            </span>
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchSelect
                  items={formData.cliente ? [{ id: formData.cliente.id, label: formData.cliente.nombre_razon_social ?? formData.cliente.nombre ?? "" }] : []}
                  onSearch={searchClientes}
                  onSelectItem={handleClienteSelected}
                  value={formData.cliente?.id ?? null}
                  onChange={handleClienteChange}
                  placeholder="Buscar cliente..."
                  disabled={!isEditable}
                />
              </div>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => setModalClienteOpen(true)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center gap-1 whitespace-nowrap"
                  title="Crear cliente rápido"
                >
                  <UserPlus size={15} />
                  Nuevo
                </button>
              )}
            </div>
          </div>
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

      {/* Ítems libres */}
      <LineasLibreTable
        lineas={formData.lineas}
        modoIva={formData.modoIva}
        ivaGlobal={formData.ivaGlobal}
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

      <ClienteRapidoModal
        isOpen={modalClienteOpen}
        onClose={() => setModalClienteOpen(false)}
        onCreated={handleClienteCreado}
      />
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Paperclip, Calculator, Info, Plus, Minus, Edit2, X, Check } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import SearchSelect from "../../components/ui/SearchSelect";
import {
  obtenerItem,
  crearItem,
  actualizarItem,
  eliminarItem,
  registrarMovimientoItem,
  listarComprasItem,
  editarCompraItem,
} from "../../services/catalogo.service";
import { listarProveedores } from "../../services/proveedores.service";
import { showToast, showConfirm } from "../../utils/notifications";
import { obtenerDashboard } from "../../services/dashboard.service";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value || 0);

const searchProveedores = async (q) => {
  try {
    const res = await listarProveedores({ search: q, activos: "1", perPage: 15 });
    return (res.data || []).map((p) => ({
      id: p.id,
      label: `${p.nombre}${p.nit ? " · " + p.nit : ""}`,
    }));
  } catch {
    return [];
  }
};

const hoy = () => new Date().toISOString().slice(0, 10);

export default function CatalogoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [cajaDisponible, setCajaDisponible] = useState(null);

  // ── Info básica ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    tipo: "PRODUCTO",
    nombre: "",
    descripcion: "",
    precio_compra: "",
    precio_venta_sugerido: "",
    controla_inventario: false,
    stock_minimo: "",
    cantidad_inicial: "",
    is_activo: true,
  });

  // ── Proveedor (para la compra del stock inicial — solo en CREATE) ────────────
  const [createProveedorId, setCreateProveedorId] = useState(null);
  const [createCondicion, setCreateCondicion] = useState("CONTADO");
  const [createAbono, setCreateAbono] = useState("");

  // ── Archivo (para compra en CREATE) ─────────────────────────────────────────
  const [archivoNombre, setArchivoNombre] = useState("Sin archivo");
  const [archivo, setArchivo] = useState(null);
  const archivoInputRef = useRef(null);

  // ── Compras del item (solo EDIT) ─────────────────────────────────────────────
  const [itemCompras, setItemCompras] = useState([]);
  const [editandoCompra, setEditandoCompra] = useState(null); // { compra_id, cantidad, precio_unitario, motivo }
  const [savingCompra, setSavingCompra] = useState(false);

  // ── Sección "Actualizar stock" (solo EDIT) ───────────────────────────────────
  const [stockActual, setStockActual] = useState(0);
  const [stockAccion, setStockAccion] = useState("AGREGAR");
  const [stockCantidad, setStockCantidad] = useState("");
  const [stockMotivo, setStockMotivo] = useState("");
  const [stockProveedorId, setStockProveedorId] = useState(null);
  const [stockProveedorItems, setStockProveedorItems] = useState([]); // fallback label
  const [stockCondicion, setStockCondicion] = useState("LIBRE");
  const [stockAbono, setStockAbono] = useState("");
  const [stockPrecioUnitario, setStockPrecioUnitario] = useState("");
  const [stockFecha, setStockFecha] = useState(hoy());
  const [stockArchivo, setStockArchivo] = useState(null);
  const [stockArchivoNombre, setStockArchivoNombre] = useState("Sin archivo");
  const stockArchivoRef = useRef(null);

  // ── Cargar datos iniciales ───────────────────────────────────────────────────
  useEffect(() => {
    obtenerDashboard()
      .then((data) => setCajaDisponible(data.resumen?.total_en_caja ?? 0))
      .catch(() => setCajaDisponible(null));
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    Promise.all([
      obtenerItem(id),
      listarComprasItem(id).catch(() => []),
    ]).then(([data, compras]) => {
        if (cancelled) return;
        const inventario = data.inventario || {};
        setFormData({
          tipo: data.tipo || "PRODUCTO",
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          precio_compra: data.precio_compra || "",
          precio_venta_sugerido: data.precio_venta_sugerido || "",
          controla_inventario: data.controla_inventario || false,
          stock_minimo: inventario.unidades_minimas || "",
          cantidad_inicial: "",
          is_activo: data.is_activo ?? true,
        });
        setStockActual(inventario.unidades_actuales ?? 0);

        // Pre-fill provider for stock update from item's current proveedor
        if (data.proveedor_id && data.proveedor) {
          const label = `${data.proveedor.nombre}${data.proveedor.nit ? " · " + data.proveedor.nit : ""}`;
          setStockProveedorId(data.proveedor_id);
          setStockProveedorItems([{ id: data.proveedor_id, label }]);
        }
        setStockPrecioUnitario(data.precio_compra || "");
        setItemCompras(compras || []);
      })
      .catch(() => { if (!cancelled) showToast("Error al cargar el item", "error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, isEditing]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const tieneDecimales = (v) => v !== "" && v !== null && !Number.isInteger(Number(v));

  const validarEnteros = () => {
    if (!formData.controla_inventario) return true;
    const errores = [];
    if (formData.stock_minimo && tieneDecimales(formData.stock_minimo)) errores.push("Stock mínimo");
    if (!isEditing && formData.cantidad_inicial && tieneDecimales(formData.cantidad_inicial)) errores.push("Cantidad inicial");
    if (errores.length) { showToast(`${errores.join(" y ")} debe ser entero (sin decimales)`, "error"); return false; }
    return true;
  };

  const costoEstimado = () => {
    const cant = parseInt(formData.cantidad_inicial) || 0;
    const prec = parseFloat(formData.precio_compra) || 0;
    return cant * prec;
  };

  const mostrarSeccionPago = !isEditing && formData.controla_inventario &&
    (parseInt(formData.cantidad_inicial) || 0) > 0 &&
    (parseFloat(formData.precio_compra) || 0) > 0;

  const costoStock = costoEstimado();
  const isCreateCredito = createCondicion === "CREDITO";
  const isCreateLibre = createCondicion === "LIBRE";

  const stockCantidadNum = parseInt(stockCantidad) || 0;
  const mostrarStockEdit = isEditing && formData.controla_inventario;
  const isStockCredito = stockCondicion === "CREDITO";
  const isStockLibre = stockCondicion === "LIBRE";

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre) { showToast("El nombre es obligatorio", "error"); return; }
    if (!validarEnteros()) return;

    if (mostrarSeccionPago && createCondicion === "CONTADO") {
      if (cajaDisponible === null) {
        showToast("No se pudo verificar el saldo en caja. Recarga la página.", "error"); return;
      }
      if (costoStock > cajaDisponible) {
        showToast(`Saldo insuficiente. Disponible: ${formatMoney(cajaDisponible)} · Costo: ${formatMoney(costoStock)}`, "error"); return;
      }
    }

    setSaving(true);
    try {
      if (isEditing) {
        // 1. Actualizar info básica
        const payload = {
          tipo: formData.tipo,
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          precio_compra: formData.precio_compra ? parseFloat(formData.precio_compra) : null,
          precio_venta_sugerido: formData.precio_venta_sugerido ? parseFloat(formData.precio_venta_sugerido) : null,
          controla_inventario: formData.controla_inventario,
          is_activo: formData.is_activo,
          proveedor_id: stockProveedorId ?? null,
        };
        if (formData.controla_inventario && formData.stock_minimo) {
          payload.unidades_minimas = Math.round(Number(formData.stock_minimo));
        }
        await actualizarItem(id, payload);

        // 2. Registrar movimiento de stock si se llenó cantidad
        if (mostrarStockEdit && stockCantidadNum > 0) {
          // Validate proveedor required for CONTADO/CREDITO
          if (stockAccion === "AGREGAR" && ["CONTADO", "CREDITO"].includes(stockCondicion) && !stockProveedorId) {
            showToast("El proveedor es obligatorio para compras a contado o crédito.", "error");
            setSaving(false);
            return;
          }
          const movData = {
            accion: stockAccion,
            cantidad: stockCantidadNum,
            motivo: stockMotivo || undefined,
          };
          if (stockAccion === "AGREGAR") {
            movData.condicion_pago = stockCondicion;
            movData.fecha = stockFecha;
            movData.precio_unitario = parseFloat(stockPrecioUnitario) || undefined;
            if (stockProveedorId) movData.proveedor_id = stockProveedorId;
            if (isStockCredito && stockAbono) movData.abono_inicial = parseFloat(stockAbono);
          }
          await registrarMovimientoItem(id, movData, isStockLibre ? null : stockArchivo);
        }

        showToast("Item actualizado correctamente", "success");
      } else {
        // Crear
        const fd = new FormData();
        fd.append("tipo", formData.tipo);
        fd.append("nombre", formData.nombre);
        if (formData.descripcion) fd.append("descripcion", formData.descripcion);
        if (formData.precio_compra) fd.append("precio_compra", parseFloat(formData.precio_compra));
        if (formData.precio_venta_sugerido) fd.append("precio_venta_sugerido", parseFloat(formData.precio_venta_sugerido));
        fd.append("controla_inventario", formData.controla_inventario ? "1" : "0");
        fd.append("is_activo", formData.is_activo ? "1" : "0");
        if (createProveedorId) fd.append("proveedor_id", createProveedorId);

        if (formData.controla_inventario) {
          if (formData.stock_minimo) fd.append("unidades_minimas", Math.round(Number(formData.stock_minimo)));
          const cantInicial = Math.round(Number(formData.cantidad_inicial) || 0);
          if (cantInicial > 0) {
            fd.append("cantidad_inicial", cantInicial);
            if (costoStock > 0) {
              fd.append("condicion_pago", createCondicion);
              if (isCreateCredito && createAbono) fd.append("abono_inicial", parseFloat(createAbono));
              if (!isCreateLibre && archivo) fd.append("archivo", archivo);
            }
          }
        }

        await crearItem(fd);
        showToast("Item creado correctamente", "success");
      }
      navigate("/catalogo");
    } catch (err) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await showConfirm("¿Desactivar este item?", { title: "Desactivar item", okLabel: "Sí, desactivar" });
    if (!ok) return;
    try {
      await eliminarItem(id);
      showToast("Item desactivado correctamente", "success");
      setTimeout(() => navigate("/catalogo"), 600);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const iniciarEditarCompra = (compra) => {
    setEditandoCompra({
      compra_id:       compra.compra_id,
      cantidad:        String(compra.cantidad),
      precio_unitario: String(compra.precio_unitario),
      motivo:          "",
    });
  };

  const cancelarEditarCompra = () => setEditandoCompra(null);

  const guardarEditarCompra = async () => {
    if (!editandoCompra) return;
    const nuevaCantidad = parseInt(editandoCompra.cantidad);
    if (!nuevaCantidad || nuevaCantidad <= 0) {
      showToast("La cantidad debe ser mayor a cero.", "error"); return;
    }
    setSavingCompra(true);
    try {
      await editarCompraItem(id, editandoCompra.compra_id, {
        cantidad:        nuevaCantidad,
        precio_unitario: parseFloat(editandoCompra.precio_unitario) || undefined,
        motivo:          editandoCompra.motivo || undefined,
      });
      showToast("Compra actualizada correctamente.", "success");
      const [updatedCompras, updatedItem] = await Promise.all([
        listarComprasItem(id).catch(() => itemCompras),
        obtenerItem(id).catch(() => null),
      ]);
      setItemCompras(updatedCompras);
      if (updatedItem?.inventario) {
        setStockActual(updatedItem.inventario.unidades_actuales ?? 0);
      }
      setEditandoCompra(null);
    } catch (err) {
      showToast(err.message || "Error al editar compra.", "error");
    } finally {
      setSavingCompra(false);
    }
  };

  const comprasEditables = itemCompras.filter(c =>
    c.estado !== "ANULADA" && ["CONTADO", "CREDITO"].includes(c.condicion_pago)
  );

  const formatMoneyCOP = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v || 0);

  const estadoBadge = (estado) => {
    const styles = {
      PENDIENTE: "bg-yellow-100 text-yellow-700",
      PARCIAL:   "bg-orange-100 text-orange-700",
      PAGADA:    "bg-green-100 text-green-700",
      ANULADA:   "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[estado] || "bg-gray-100 text-gray-700"}`}>
        {estado}
      </span>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-gray-500">Cargando item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? `Editar item #${id}` : "Nuevo item"}
        </h1>
        <Button text="Volver" icon={ArrowLeft} variant="outline" onClick={() => navigate("/catalogo")} />
      </div>

      {/* ── Información básica ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Información del item</h2>
        <form id="item-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                name="tipo" value={formData.tipo} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PRODUCTO">PRODUCTO</option>
                <option value="INSUMO">INSUMO</option>
                <option value="SERVICIO">SERVICIO</option>
              </select>
            </div>

            <Input name="nombre" label="Nombre *" value={formData.nombre} onChange={handleChange} required placeholder="Nombre del item" />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion" value={formData.descripcion} onChange={handleChange} rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del item..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio compra <span className="text-gray-400 text-xs">(costo unitario)</span>
              </label>
              <input
                type="number" name="precio_compra" value={formData.precio_compra} onChange={handleChange}
                step="0.01" min="0" placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio venta sugerido</label>
              <input
                type="number" name="precio_venta_sugerido" value={formData.precio_venta_sugerido} onChange={handleChange}
                step="0.01" min="0" placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Controla inventario</label>
              <select
                value={formData.controla_inventario ? "1" : "0"}
                onChange={(e) => setFormData((prev) => ({ ...prev, controla_inventario: e.target.value === "1" }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">No</option>
                <option value="1">Sí</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
              <input
                type="number" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange}
                step="1" min="0" disabled={!formData.controla_inventario} placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Cantidad inicial — solo en CREATE */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad inicial</label>
                <input
                  type="number" name="cantidad_inicial" value={formData.cantidad_inicial} onChange={handleChange}
                  step="1" min="0" disabled={!formData.controla_inventario} placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activo</label>
              <select
                value={formData.is_activo ? "1" : "0"}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_activo: e.target.value === "1" }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Sí</option>
                <option value="0">No</option>
              </select>
            </div>
          </div>

          {/* ── Pago del stock inicial (CREATE) ─────────────────────────────── */}
          {mostrarSeccionPago && (
            <div className="mt-2 pt-4 border-t border-gray-200 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Calculator size={14} className="text-blue-500" />
                Pago del stock inicial
              </h3>

              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                <Calculator className="text-blue-500 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Costo estimado</p>
                  <p className="text-xl font-bold text-gray-800">{formatMoney(costoStock)}</p>
                  <p className="text-xs text-gray-400">{formData.cantidad_inicial} uds. × {formatMoney(parseFloat(formData.precio_compra) || 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchSelect
                  value={createProveedorId}
                  onChange={setCreateProveedorId}
                  onSearch={searchProveedores}
                  label="Proveedor"
                  placeholder="Buscar proveedor (opcional)..."
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo se pagó? *</label>
                  <select
                    value={createCondicion}
                    onChange={(e) => {
                      if (e.target.value === "CONTADO" && (cajaDisponible ?? 0) <= 0) {
                        showToast("No hay saldo disponible en caja.", "warning"); return;
                      }
                      setCreateCondicion(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CONTADO">Contado — descuenta del saldo ahora</option>
                    <option value="CREDITO">A crédito — lo pagaré después</option>
                    <option value="LIBRE">Libre — solo registro, no afecta caja</option>
                  </select>
                </div>

                {isCreateCredito && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abono inicial <span className="text-gray-400 text-xs">(opcional)</span></label>
                    <input
                      type="number" value={createAbono} onChange={(e) => setCreateAbono(e.target.value)}
                      step="0.01" min="0" placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Si pagaste una parte ahora y el resto queda a crédito.</p>
                  </div>
                )}

                {!isCreateLibre && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soporte del pago <span className="text-gray-400 text-xs">(opcional)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button" onClick={() => archivoInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Paperclip size={14} /> Adjuntar archivo
                      </button>
                      <span className="text-sm text-gray-500">{archivoNombre}</span>
                      <input ref={archivoInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => { const f = e.target.files[0]; setArchivo(f || null); setArchivoNombre(f?.name || "Sin archivo"); }}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {createCondicion === "CONTADO" && cajaDisponible !== null && costoStock > cajaDisponible && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-800">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p><strong>Saldo insuficiente:</strong> caja {formatMoney(cajaDisponible)} / costo {formatMoney(costoStock)}. Usa crédito o registro libre.</p>
                </div>
              )}
              {isCreateCredito && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm text-yellow-800">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p><strong>Pago a crédito:</strong> se creará una compra pendiente. Los abonos se registran desde Compras.</p>
                </div>
              )}
              {isCreateLibre && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-sm text-blue-800">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p><strong>Registro libre:</strong> solo se registra el item y el inventario, no afecta la caja.</p>
                </div>
              )}
            </div>
          )}

          {/* Botones del formulario básico */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div />
            <div className="flex gap-3">
              {isEditing && (
                <Button type="button" text="Desactivar" icon={Trash2} variant="danger" onClick={handleDelete} />
              )}
              <Button
                type="submit"
                form="item-form"
                text={saving ? "Guardando..." : "Guardar"}
                icon={Save}
                variant="primary"
                disabled={saving}
              />
            </div>
          </div>
        </form>
      </div>

      {/* ── Actualizar stock (solo EDIT + controla_inventario) ─────────────── */}
      {mostrarStockEdit && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Actualizar stock</h2>
            <span className="text-sm text-gray-600 font-medium">
              Stock actual: <strong className="text-blue-700">{stockActual}</strong> unidades
            </span>
          </div>

          {/* Acción */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setStockAccion("AGREGAR")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                stockAccion === "AGREGAR"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Plus size={15} /> Agregar
            </button>
            <button
              type="button"
              onClick={() => setStockAccion("RETIRAR")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                stockAccion === "RETIRAR"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Minus size={15} /> Retirar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad a {stockAccion === "AGREGAR" ? "agregar" : "retirar"} *
              </label>
              <input
                type="number" value={stockCantidad}
                onChange={(e) => setStockCantidad(e.target.value)}
                step="1" min="1" placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {stockAccion === "AGREGAR" ? "Motivo / observaciones" : "Motivo del retiro"}
                <span className="text-gray-400 text-xs ml-1">(opcional)</span>
              </label>
              <input
                type="text" value={stockMotivo}
                onChange={(e) => setStockMotivo(e.target.value)}
                placeholder={stockAccion === "AGREGAR" ? "Ej: Reposición de inventario" : "Ej: Merma, vencimiento, ajuste..."}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Campos extra solo para AGREGAR */}
            {stockAccion === "AGREGAR" && (
              <>
                <SearchSelect
                  value={stockProveedorId}
                  onChange={setStockProveedorId}
                  onSearch={searchProveedores}
                  items={stockProveedorItems}
                  label="Proveedor de esta compra"
                  placeholder="Buscar proveedor (opcional)..."
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio unitario</label>
                  <input
                    type="number" value={stockPrecioUnitario}
                    onChange={(e) => setStockPrecioUnitario(e.target.value)}
                    step="0.01" min="0" placeholder={formData.precio_compra || "0"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de la compra</label>
                  <input
                    type="date" value={stockFecha}
                    onChange={(e) => setStockFecha(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo se pagó?</label>
                  <select
                    value={stockCondicion}
                    onChange={(e) => {
                      if (e.target.value === "CONTADO" && (cajaDisponible ?? 0) <= 0) {
                        showToast("No hay saldo disponible en caja.", "warning"); return;
                      }
                      setStockCondicion(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LIBRE">Libre — solo registro, no afecta caja</option>
                    <option value="CONTADO">Contado — descuenta del saldo ahora</option>
                    <option value="CREDITO">A crédito — lo pagaré después</option>
                  </select>
                </div>

                {isStockCredito && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abono inicial <span className="text-gray-400 text-xs">(opcional)</span></label>
                    <input
                      type="number" value={stockAbono} onChange={(e) => setStockAbono(e.target.value)}
                      step="0.01" min="0" placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {!isStockLibre && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soporte del pago <span className="text-gray-400 text-xs">(opcional)</span></label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button" onClick={() => stockArchivoRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Paperclip size={14} /> Adjuntar archivo
                      </button>
                      <span className="text-sm text-gray-500">{stockArchivoNombre}</span>
                      <input ref={stockArchivoRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => { const f = e.target.files[0]; setStockArchivo(f || null); setStockArchivoNombre(f?.name || "Sin archivo"); }}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {stockCantidadNum > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              {stockAccion === "AGREGAR"
                ? `Se agregarán ${stockCantidadNum} unidades → nuevo stock: ${Number(stockActual) + stockCantidadNum}`
                : `Se retirarán ${stockCantidadNum} unidades → nuevo stock: ${Math.max(0, Number(stockActual) - stockCantidadNum)}`
              }
            </div>
          )}
        </div>
      )}

      {/* ── Compras del item (solo EDIT, solo CONTADO/CREDITO) ─────────────── */}
      {isEditing && comprasEditables.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Compras registradas
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Solo se pueden editar compras a contado o crédito no anuladas. Para reducir cantidad, no puede bajar del stock ya consumido.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase">
                  <th className="pb-2 pr-4">Compra</th>
                  <th className="pb-2 pr-4">Fecha</th>
                  <th className="pb-2 pr-4">Proveedor</th>
                  <th className="pb-2 pr-4">Condición</th>
                  <th className="pb-2 pr-4 text-right">Cantidad</th>
                  <th className="pb-2 pr-4 text-right">P. Unitario</th>
                  <th className="pb-2 pr-4 text-right">Saldo</th>
                  <th className="pb-2 text-center">Estado</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itemCompras.map((c) => {
                  const isEditando = editandoCompra?.compra_id === c.compra_id;
                  const esEditable = c.estado !== "ANULADA" && ["CONTADO", "CREDITO"].includes(c.condicion_pago);
                  return (
                    <tr key={c.compra_id} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 font-mono text-gray-600">
                        {c.numero ?? `#${c.compra_id}`}
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{c.fecha ?? "—"}</td>
                      <td className="py-2 pr-4 text-gray-600">{c.proveedor_nombre ?? "—"}</td>
                      <td className="py-2 pr-4">
                        <span className="text-xs font-medium text-gray-500">{c.condicion_pago}</span>
                      </td>

                      {isEditando ? (
                        <>
                          <td className="py-2 pr-4">
                            <input
                              type="number" min="1" step="1"
                              value={editandoCompra.cantidad}
                              onChange={(e) => setEditandoCompra(prev => ({ ...prev, cantidad: e.target.value }))}
                              className="w-20 px-2 py-1 border border-blue-400 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              type="number" min="0" step="0.01"
                              value={editandoCompra.precio_unitario}
                              onChange={(e) => setEditandoCompra(prev => ({ ...prev, precio_unitario: e.target.value }))}
                              className="w-28 px-2 py-1 border border-blue-400 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              type="text"
                              value={editandoCompra.motivo}
                              onChange={(e) => setEditandoCompra(prev => ({ ...prev, motivo: e.target.value }))}
                              placeholder="Motivo (opc.)"
                              className="w-32 px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 text-center">
                            <div className="flex gap-1 justify-center">
                              <button
                                type="button" onClick={guardarEditarCompra} disabled={savingCompra}
                                className="p-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                title="Guardar"
                              >
                                <Check size={13} />
                              </button>
                              <button
                                type="button" onClick={cancelarEditarCompra}
                                className="p-1.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
                                title="Cancelar"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 pr-4 text-right font-medium">{c.cantidad}</td>
                          <td className="py-2 pr-4 text-right">{formatMoneyCOP(c.precio_unitario)}</td>
                          <td className="py-2 pr-4 text-right text-orange-600 font-medium">
                            {c.condicion_pago === "CREDITO" ? formatMoneyCOP(c.saldo_pendiente) : "—"}
                          </td>
                          <td className="py-2 pr-4 text-center">{estadoBadge(c.estado)}</td>
                          <td className="py-2 text-center">
                            {esEditable && (
                              <button
                                type="button" onClick={() => iniciarEditarCompra(c)}
                                className="p-1.5 rounded text-blue-600 hover:bg-blue-50"
                                title="Editar cantidad / precio"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

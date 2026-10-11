import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, Pencil, Send, XCircle, DollarSign } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import FacturasTable from "../../components/ui/FacturasTable";
import CobroModalUnificado from "../../components/ui/CobroModalUnificado";
import { obtenerCliente } from "../../services/clientes.service";
import { listarFacturas, emitirFactura, anularFactura } from "../../services/facturas.service";
import { showToast, showConfirm } from "../../utils/notifications";
import { formatMoney } from "../../services/dashboard.service";
import { getCached, setCached } from "../../utils/pageCache";

const calcularTotales = (data) => {
  let totalFacturado = 0, totalPagado = 0, totalSaldo = 0;
  data.forEach(f => {
    if (f.estado === 'ANULADA') return;
    const total  = parseFloat(f.total)        || 0;
    const pagado = parseFloat(f.total_pagado)  || 0;
    const saldo  = parseFloat(f.saldo)         || (total - pagado);
    totalFacturado += total;
    totalPagado    += pagado;
    totalSaldo     += saldo;
  });
  return {
    totalFacturado: formatMoney(totalFacturado),
    totalPagado:    formatMoney(totalPagado),
    totalSaldo:     formatMoney(totalSaldo),
  };
};

export default function ClienteFacturasPage() {
  const { id } = useParams();
  const CACHE_KEY = `facturas-cliente-${id}`;
  const cached = getCached(CACHE_KEY);

  const isMountedRef = useRef(true);
  const isFirstLoad  = useRef(true);

  const [cliente, setCliente]                   = useState(cached?.cliente ?? null);
  const [facturas, setFacturas]                 = useState(cached?.facturas ?? []);
  const [loading, setLoading]                   = useState(!cached);
  const [modalOpen, setModalOpen]               = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [totales, setTotales]                   = useState(
    cached ? calcularTotales(cached.facturas ?? []) : { totalFacturado: 0, totalPagado: 0, totalSaldo: 0 }
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const loadData = useCallback(async (silent = false) => {
    if (!id || !isMountedRef.current) return;
    if (!silent) setLoading(true);
    try {
      const [resCliente, resFacturas] = await Promise.all([
        obtenerCliente(id),
        listarFacturas({ cliente_id: id }),
      ]);
      if (!isMountedRef.current) return;
      const data = resFacturas.data || [];
      setCliente(resCliente);
      setFacturas(data);
      setTotales(calcularTotales(data));
      setCached(CACHE_KEY, { cliente: resCliente, facturas: data });
    } catch (error) {
      if (isMountedRef.current) showToast(error.message || "Error al cargar datos", "error");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [id, CACHE_KEY]);

  useEffect(() => {
    // Primera visita: silenciosa si hay caché, con skeleton si no
    const silent = isFirstLoad.current ? !!cached : true;
    if (isFirstLoad.current) isFirstLoad.current = false;
    loadData(silent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData]);

  const handleEmitir = async (facturaId) => {
    const ok = await showConfirm("¿Emitir esta factura? No podrá editarla después.", { title: "Emitir factura", okLabel: "Sí, emitir" });
    if (!ok) return;
    try {
      await emitirFactura(facturaId);
      showToast("Factura emitida correctamente", "success");
      loadData(true);
    } catch (err) {
      showToast(err.message || "Error al emitir", "error");
    }
  };

  const handleAnular = async (facturaId) => {
    const ok = await showConfirm("¿Anular esta factura? Esta acción no se puede deshacer.", { title: "Anular factura", okLabel: "Sí, anular" });
    if (!ok) return;
    try {
      await anularFactura(facturaId);
      showToast("Factura anulada correctamente", "success");
      loadData(true);
    } catch (err) {
      showToast(err.message || "Error al anular", "error");
    }
  };

  const handleCobrar = (row) => {
    setFacturaSeleccionada(row._raw);
    setModalOpen(true);
  };

  const renderAcciones = (row) => {
    const isBorrador = row.estado_raw === "BORRADOR";
    const puedePagar = row.estado_raw !== "ANULADA" && row.saldo_raw > 0;
    return (
      <div className="flex items-center gap-1">
        <Link to={`/facturas/ver/${row.id}?return_to=cliente&cliente_id=${id}`}>
          <IconButton icon={Eye} title="Ver" variant="info" />
        </Link>
        {isBorrador && (
          <>
            <Link to={`/facturas/editar/${row.id}`}>
              <IconButton icon={Pencil} title="Editar" variant="warning" />
            </Link>
            <IconButton icon={Send} title="Emitir" variant="success" onClick={() => handleEmitir(row.id)} />
          </>
        )}
        {puedePagar && (
          <IconButton icon={DollarSign} title="Registrar pago" variant="success" onClick={() => handleCobrar(row)} />
        )}
        {row.estado_raw !== "ANULADA" && (
          <IconButton icon={XCircle} title="Anular" variant="danger" onClick={() => handleAnular(row.id)} />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Facturas del cliente</h2>
          <p className="text-sm text-gray-400">
            {cliente ? (
              <>
                <strong>{cliente.nombre_razon_social}</strong>
                {cliente.num_documento && ` · ${cliente.tipo_documento || "Doc"}: ${cliente.num_documento}`}
                {cliente.email && ` · ${cliente.email}`}
              </>
            ) : "Cargando..."}
          </p>
        </div>
        <Link to="/clientes">
          <Button text="Volver a clientes" icon={ArrowLeft} variant="outline" />
        </Link>
      </div>

      {/* KPIs — solo facturas NO anuladas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total facturado</div>
          <div className="text-xl font-bold text-blue-600">{totales.totalFacturado}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total pagado</div>
          <div className="text-xl font-bold text-emerald-600">{totales.totalPagado}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Saldo pendiente</div>
          <div className="text-xl font-bold text-red-600">{totales.totalSaldo}</div>
        </div>
      </div>

      {/* Tabla — muestra todas las facturas incluyendo anuladas (historial) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <FacturasTable
          facturas={facturas}
          hideColumns={["cliente_nombre"]}
          actions={renderAcciones}
          loading={loading}
          empty="No hay facturas para este cliente."
          pageSize={10}
        />
      </div>

      <CobroModalUnificado
        key={facturaSeleccionada?.id ?? 0}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setFacturaSeleccionada(null); }}
        onPagoOk={() => { setModalOpen(false); setFacturaSeleccionada(null); loadData(true); }}
        factura={facturaSeleccionada}
      />
    </div>
  );
}

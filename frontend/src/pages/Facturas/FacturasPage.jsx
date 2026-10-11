import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Eye, Send, XCircle, Search, DollarSign } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import FacturasTable from "../../components/ui/FacturasTable";
import KpiCard from "../../components/ui/KpiCard";
import CobroModalUnificado from "../../components/ui/CobroModalUnificado";
import { useFacturas } from "../../hooks/useFacturas";
import { formatMoney, formatNumber } from "../../services/dashboard.service";


export default function FacturasPage() {
  const {
    facturas, totales, loading, error,
    search, setSearch,
    estado, setEstado,
    handleEmitir, handleAnular,
    reload,
  } = useFacturas();

  const [modalOpen, setModalOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  const handleCobrar = (row) => {
    setFacturaSeleccionada(row._raw);
    setModalOpen(true);
  };

  const handlePagoOk = () => {
    setModalOpen(false);
    setFacturaSeleccionada(null);
    reload();
  };

  const renderAcciones = (row) => {
    const isBorrador = row.estado_raw === "BORRADOR";
    const puedePagar = row.estado_raw !== "ANULADA" && row.saldo_raw > 0;
    return (
      <div className="flex items-center gap-1">
        <Link to={`/facturas/ver/${row.id}`}>
          <IconButton icon={Eye} title="Ver" variant="info" />
        </Link>
        {isBorrador && (
          <>
            <Link to={`/facturas/editar/${row.id}`}>
              <IconButton icon={Pencil} title="Editar" variant="warning" />
            </Link>
            <IconButton
              icon={Send}
              title="Emitir"
              variant="success"
              onClick={() => handleEmitir(row.id)}
            />
          </>
        )}
        {puedePagar && (
          <IconButton
            icon={DollarSign}
            title="Registrar pago"
            variant="success"
            onClick={() => handleCobrar(row)}
          />
        )}
        {row.estado_raw !== "ANULADA" && (
          <IconButton
            icon={XCircle}
            title="Anular"
            variant="danger"
            onClick={() => handleAnular(row.id)}
          />
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center text-red-500">
          <XCircle className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-semibold mt-2">Error al cargar facturas</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={reload} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Facturas</h2>
          <p className="text-sm text-gray-400">Gestión de facturas de venta</p>
        </div>
        <Link
          to="/facturas/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} /> Nueva factura
        </Link>
      </div>

      {/* KPIs resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard
          title="Facturas activas"
          value={formatNumber(totales.total_activas)}
          subtitle={`${formatNumber(totales.total_emitidas)} emitidas · ${formatNumber(totales.total_borrador)} borradores`}
          iconClass="bi bi-file-earmark-text-fill"
          color="white"
          iconColor="blue"
          to="/facturas"
          loading={loading}
        />
        <KpiCard
          title="Por cobrar"
          value={formatMoney(totales.total_saldo_pendiente)}
          subtitle="Saldo pendiente en facturas"
          iconClass="bi bi-hourglass-split"
          color="white"
          iconColor="red"
          to="/finanzas/pendientes"
          loading={loading}
        />
        <KpiCard
          title="Ya cobrado"
          value={formatMoney(totales.total_pagado)}
          subtitle="Total recaudado en pagos de facturas"
          iconClass="bi bi-check-circle-fill"
          color="white"
          iconColor="emerald"
          to="/finanzas/ingresos"
          loading={loading}
        />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por número o cliente..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="EMITIDA">Emitida</option>
            <option value="ANULADA">Anulada</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200" style={{ height: 600 }}>
        <div className="p-3 flex flex-col h-full">
          <FacturasTable
            facturas={facturas}
            actions={renderAcciones}
            loading={loading}
            empty="No hay facturas registradas."
            pageSize={10}
          />
        </div>
      </div>

      <CobroModalUnificado
        key={facturaSeleccionada?.id ?? 0}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setFacturaSeleccionada(null); }}
        onPagoOk={handlePagoOk}
        factura={facturaSeleccionada}
      />
    </div>
  );
}

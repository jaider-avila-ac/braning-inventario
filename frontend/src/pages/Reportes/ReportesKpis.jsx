import KpiCard from "../../components/ui/KpiCard";

const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v || 0);

function DesgloseLine({ label, value, bold, colorClass = "text-gray-800", loading = false }) {
  return (
    <div className={`flex justify-between items-center text-sm ${bold ? "pt-2 border-t border-gray-100 font-semibold" : ""}`}>
      <span className={bold ? "text-gray-700" : "text-gray-500"}>{label}</span>
      {loading
        ? <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        : <span className={bold ? `font-bold ${colorClass}` : "font-medium text-gray-700"}>{fmt(value)}</span>
      }
    </div>
  );
}

const Skel = ({ w = "w-20", h = "h-5", color = "bg-gray-200" }) => (
  <div className={`${h} ${w} ${color} rounded animate-pulse inline-block`} />
);

export default function ReportesKpis({ reporte, loading = false }) {
  const balanceOk = (reporte.balance_real || 0) >= 0;

  return (
    <div className="space-y-3 mb-4">
      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Total ingresos"   value={fmt(reporte.total_ingresos)}  iconClass="bi bi-arrow-up-circle-fill"   color="green"                        loading={loading} />
        <KpiCard title="Total egresos"    value={fmt(reporte.total_egresos)}   iconClass="bi bi-arrow-down-circle-fill" color="orange"                       loading={loading} />
        <KpiCard title="Total en caja"    value={fmt(reporte.balance_real)}    iconClass="bi bi-wallet2"                color={balanceOk ? "teal" : "red"}   loading={loading} />
        <KpiCard title="Saldo por cobrar" value={fmt(reporte.saldo_pendiente)} iconClass="bi bi-hourglass-split"        color="red"                          loading={loading} />
      </div>

      {/* Referencia de facturación */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap gap-6 text-sm">
        <div>
          <span className="text-gray-500">Total facturado</span>
          <span className="ml-2 font-semibold text-gray-800">{loading ? <Skel /> : fmt(reporte.total_facturado)}</span>
        </div>
        <div>
          <span className="text-gray-500">Cobrado en facturas</span>
          <span className="ml-2 font-semibold text-emerald-600">{loading ? <Skel /> : fmt(reporte.total_cobrado)}</span>
        </div>
        <div>
          <span className="text-gray-500">Pendiente de cobro</span>
          <span className="ml-2 font-semibold text-amber-600">{loading ? <Skel /> : fmt(reporte.saldo_pendiente)}</span>
        </div>
      </div>

      {/* Desglose ingresos / egresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <i className="bi bi-arrow-up-circle text-green-500"></i>
            <span className="text-sm font-semibold text-gray-700">Desglose de ingresos</span>
          </div>
          <div className="p-4 space-y-2">
            <DesgloseLine label="Cobros de facturas"  value={loading ? null : reporte.ingresos_facturas}  loading={loading} />
            <DesgloseLine label="Ventas de mostrador" value={loading ? null : reporte.ingresos_mostrador} loading={loading} />
            <DesgloseLine label="Ingresos manuales"   value={loading ? null : reporte.ingresos_manuales}  loading={loading} />
            <DesgloseLine label="Total ingresos" value={loading ? null : reporte.total_ingresos} bold colorClass="text-green-600" loading={loading} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <i className="bi bi-arrow-down-circle text-red-500"></i>
            <span className="text-sm font-semibold text-gray-700">Desglose de egresos</span>
          </div>
          <div className="p-4 space-y-2">
            <DesgloseLine label="Egresos por compras" value={loading ? null : reporte.egresos_compras}  loading={loading} />
            <DesgloseLine label="Egresos manuales"    value={loading ? null : reporte.egresos_manuales} loading={loading} />
            <DesgloseLine label="Total egresos" value={loading ? null : reporte.total_egresos} bold colorClass="text-red-600" loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

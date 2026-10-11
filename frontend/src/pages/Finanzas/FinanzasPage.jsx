import { Link } from "react-router-dom";
import { RefreshCw, Search, X, Wallet, Zap, PlusCircle, TrendingDown, DollarSign, TrendingUp, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useFinanzas } from "./useFinanzas";

export default function FinanzasPage() {
  const { kpis, loading, refreshing, filtros, actualizarFiltros, limpiarFiltros, recargar, formatMoney } = useFinanzas();

  const handleFiltroChange = (campo, valor) => {
    actualizarFiltros({ [campo]: valor });
  };

  const handleLimpiar = () => {
    limpiarFiltros();
  };

  const balancePositivo = kpis.balance_real >= 0;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            Finanzas
          </h1>
          <p className="text-sm text-gray-500">Cobros, ingresos, egresos y balance de caja</p>
        </div>
        <Button text="Actualizar" icon={RefreshCw} variant="outline" onClick={recargar} disabled={loading || refreshing} />
      </div>

      {/* Filtros por fecha */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <Input
            label="Desde"
            type="date"
            value={filtros.desde}
            onChange={(e) => handleFiltroChange("desde", e.target.value)}
          />
          <Input
            label="Hasta"
            type="date"
            value={filtros.hasta}
            onChange={(e) => handleFiltroChange("hasta", e.target.value)}
          />
          <Button text="Limpiar" icon={X} variant="outline" onClick={handleLimpiar} />
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 sm:pb-1">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              Actualizando...
            </div>
          )}
        </div>
      </div>

      {/* Resumen principal — 3 KPIs grandes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-emerald-600 rounded-xl p-5 shadow-md text-white">
          <div className="flex items-center gap-3">
            <ArrowUpCircle className="w-10 h-10 text-emerald-200 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-emerald-100 uppercase tracking-wide">Total ingresos</div>
              {loading ? <div className="h-9 w-36 bg-white/30 rounded-lg animate-pulse mt-1" /> : <div className="text-3xl font-bold leading-tight">{formatMoney(kpis.total_en_caja)}</div>}
              <div className="text-xs text-emerald-100 mt-0.5">Facturas + Mostrador + Manuales</div>
            </div>
          </div>
        </div>

        <div className="bg-red-600 rounded-xl p-5 shadow-md text-white">
          <div className="flex items-center gap-3">
            <ArrowDownCircle className="w-10 h-10 text-red-200 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-red-100 uppercase tracking-wide">Total egresos</div>
              {loading ? <div className="h-9 w-36 bg-white/30 rounded-lg animate-pulse mt-1" /> : <div className="text-3xl font-bold leading-tight">{formatMoney(kpis.total_egresos)}</div>}
              <div className="text-xs text-red-100 mt-0.5">Compras + Gastos manuales</div>
            </div>
          </div>
        </div>

        <div className={`${balancePositivo ? "bg-blue-600" : "bg-orange-600"} rounded-xl p-5 shadow-md text-white`}>
          <div className="flex items-center gap-3">
            <Wallet className="w-10 h-10 opacity-60 shrink-0" />
            <div>
              <div className="text-xs font-semibold opacity-80 uppercase tracking-wide">Total en caja</div>
              {loading ? <div className="h-9 w-36 bg-white/30 rounded-lg animate-pulse mt-1" /> : <div className="text-3xl font-bold leading-tight">{formatMoney(kpis.balance_real)}</div>}
              <div className="text-xs opacity-70 mt-0.5">Ingresos − Egresos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose: ingresos / egresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Ingresos por tipo */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-emerald-50">
            <span className="text-xs font-bold uppercase tracking-wide text-emerald-700 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Ingresos por tipo
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex justify-between items-center px-4 py-3">
              <div>
                <div className="text-sm font-medium text-gray-800">Pagos de facturas</div>
                <div className="text-xs text-gray-400">Cobros aplicados a facturas</div>
              </div>
              <div className="text-sm font-bold text-emerald-600">{loading ? <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /> : formatMoney(kpis.ingresos_facturas)}</div>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <div>
                <div className="text-sm font-medium text-gray-800">Ventas mostrador</div>
                <div className="text-xs text-gray-400">Ventas de contado directas</div>
              </div>
              <div className="text-sm font-bold text-emerald-600">{loading ? <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /> : formatMoney(kpis.ingresos_mostrador)}</div>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <div>
                <div className="text-sm font-medium text-gray-800">Ingresos manuales</div>
                <div className="text-xs text-gray-400">Entradas adicionales registradas</div>
              </div>
              <div className="text-sm font-bold text-emerald-600">{loading ? <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /> : formatMoney(kpis.ingresos_manuales)}</div>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-emerald-50">
              <div className="text-sm font-bold text-gray-700">Total</div>
              <div className="text-sm font-bold text-emerald-700">{loading ? <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /> : formatMoney(kpis.total_en_caja)}</div>
            </div>
          </div>
        </div>

        {/* Egresos por tipo */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-red-50">
            <span className="text-xs font-bold uppercase tracking-wide text-red-700 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Egresos por tipo
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex justify-between items-center px-4 py-3">
              <div>
                <div className="text-sm font-medium text-gray-800">Egresos por compras</div>
                <div className="text-xs text-gray-400">Pagos a proveedores registrados</div>
              </div>
              <div className="text-sm font-bold text-red-600">{loading ? <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /> : formatMoney(kpis.egresos_compras)}</div>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <div>
                <div className="text-sm font-medium text-gray-800">Egresos manuales</div>
                <div className="text-xs text-gray-400">Gastos y salidas adicionales</div>
              </div>
              <div className="text-sm font-bold text-red-600">{loading ? <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /> : formatMoney(kpis.egresos_manuales)}</div>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-red-50">
              <div className="text-sm font-bold text-gray-700">Total</div>
              <div className="text-sm font-bold text-red-700">{loading ? <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /> : formatMoney(kpis.total_egresos)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Saldos pendientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Saldo por cobrar */}
        <Link to="/finanzas/pendientes" className="block">
          <div className="bg-white rounded-xl border border-amber-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Saldo por cobrar</div>
                  {loading ? <div className="h-8 w-32 bg-amber-100 rounded-lg animate-pulse mt-1" /> : <div className="text-2xl font-bold text-amber-600">{formatMoney(kpis.saldo_pendiente)}</div>}
                  <div className="text-xs text-gray-400 mt-0.5">Lo que me deben los clientes</div>
                </div>
              </div>
              {kpis.pendientes_count > 0 && (
                <span className="bg-amber-500 text-white rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center text-xs font-bold">
                  {kpis.pendientes_count}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Cuentas por pagar */}
        <Link to="/compras" className="block">
          <div className="bg-white rounded-xl border border-orange-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cuentas por pagar</div>
                {loading ? <div className="h-8 w-32 bg-orange-100 rounded-lg animate-pulse mt-1" /> : <div className="text-2xl font-bold text-orange-600">{formatMoney(kpis.cuentas_por_pagar)}</div>}
                <div className="text-xs text-gray-400 mt-0.5">Lo que debo a proveedores</div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/finanzas/cobro-rapido" className="block">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h6 className="font-semibold text-gray-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              Cobro rápido
            </h6>
            <p className="text-xs text-gray-500 mt-1">Buscar factura y registrar pago.</p>
          </div>
        </Link>

        <Link to="/finanzas/pendientes" className="block">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h6 className="font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              Saldos pendientes
            </h6>
            <p className="text-xs text-gray-500 mt-1">Facturas con saldo pendiente.</p>
          </div>
        </Link>

        <Link to="/finanzas/ingresos" className="block">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h6 className="font-semibold text-gray-800 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-green-500" />
              Ingresos
            </h6>
            <p className="text-xs text-gray-500 mt-1">Registrar y consultar ingresos manuales.</p>
          </div>
        </Link>

        <Link to="/finanzas/egresos" className="block">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <h6 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Egresos
            </h6>
            <p className="text-xs text-gray-500 mt-1">Registrar y consultar egresos.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

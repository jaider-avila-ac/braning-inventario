import { useReportes } from "./useReportes";
import ReportesKpis from "./ReportesKpis";
import ReportesRendimiento from "./ReportesRendimiento";

export default function ReportesPage() {
  const { loading, refreshing, kpis, items, filtros, actualizarFiltros, generarReporte } = useReportes();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-graph-up text-blue-500"></i>
            Reporte Financiero
          </h1>
          <p className="text-sm text-gray-500">Resumen de facturación, cobros y egresos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={filtros.desde}
              onChange={(e) => actualizarFiltros({ desde: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={filtros.hasta}
              onChange={(e) => actualizarFiltros({ hasta: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={generarReporte}
              disabled={loading || refreshing}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {!loading && <i className="bi bi-graph-up"></i>}
              <span>{loading ? "Generando..." : "Generar reporte"}</span>
            </button>
          </div>
        </div>
      </div>

      <ReportesKpis reporte={kpis} loading={loading} />
      <ReportesRendimiento items={items} loading={loading} />
    </div>
  );
}
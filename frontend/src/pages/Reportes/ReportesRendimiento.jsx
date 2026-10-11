import DataTable from "../../components/ui/DataTable";

const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("es-CO").format(value || 0);
};

function MargenBadge({ margen }) {
  const pct = parseFloat(margen) || 0;
  const cls = pct >= 20 ? "bg-green-100 text-green-700"
    : pct >= 10 ? "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-700";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${cls}`}>
      {pct.toFixed(1)}%
    </span>
  );
}

const TIPO_BADGE = {
  PRODUCTO: "bg-blue-100 text-blue-700",
  SERVICIO: "bg-purple-100 text-purple-700",
  INSUMO:   "bg-amber-100 text-amber-700",
};

export default function ReportesRendimiento({ items, loading }) {
  // Columnas para DataTable - con tamaños responsivos
  const columns = [
    { key: "item", label: "Ítem", sortable: true },
    { key: "tipo", label: "Tipo", sortable: true, align: "center" },
    { key: "stock", label: "Stock", sortable: true, align: "right" },
    { key: "vendidos", label: "Vendidos", sortable: true, align: "right" },
    { key: "total_costo", label: "Costo", sortable: true, align: "right" },
    { key: "precio_promedio", label: "P.Venta", sortable: true, align: "right" },
    { key: "total_subtotal", label: "Subtotal", sortable: true, align: "right" },
    { key: "total_descuento", label: "Desc.", sortable: true, align: "right" },
    { key: "total_iva", label: "IVA", sortable: true, align: "right" },
    { key: "total_ventas", label: "Ventas", sortable: true, align: "right" },
    { key: "ganancia", label: "Ganancia", sortable: true, align: "right" },
    { key: "margen", label: "Margen", sortable: true, align: "center" },
  ].map(col => ({
    ...col,
    // Texto más pequeño en pantallas pequeñas
    className: "text-xs md:text-sm"
  }));

  // Transformar datos para DataTable - todo con text-xs en móvil
  const rows = items.map((item) => {
    const margen = item.margen_ganancia || 0;
    const ganancia = item.ganancia_neta || 0;

    return {
      id: item.item_id,
      _nombre: item.item_nombre,
      item: (
        <span className="font-medium text-gray-800 text-xs md:text-sm truncate block max-w-[120px] md:max-w-[200px]" title={item.item_nombre}>
          {item.item_nombre}
        </span>
      ),
      tipo: (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${TIPO_BADGE[item.item_tipo] || "bg-gray-100 text-gray-600"} whitespace-nowrap`}>
          {item.item_tipo === "PRODUCTO" ? "Prod" : item.item_tipo === "SERVICIO" ? "Serv" : item.item_tipo}
        </span>
      ),
      stock: (
        <span className="font-semibold text-gray-700 text-xs md:text-sm">
          {formatNumber(item.cantidad_disponible || 0)}
        </span>
      ),
      vendidos: (
        <span className="font-medium text-gray-700 text-xs md:text-sm">
          {formatNumber(item.cantidad_vendida || 0)}
        </span>
      ),
      precio_promedio: (
        <span className="text-gray-600 text-xs md:text-sm">{formatMoney(item.valor_unitario_promedio)}</span>
      ),
      total_subtotal: (
        <span className="text-gray-600 text-xs md:text-sm">{formatMoney(item.total_subtotal)}</span>
      ),
      total_descuento: (
        <span className="text-red-500 text-xs md:text-sm">{formatMoney(item.total_descuento)}</span>
      ),
      total_iva: (
        <span className="text-blue-600 text-xs md:text-sm">{formatMoney(item.total_iva)}</span>
      ),
      total_ventas: (
        <span className="font-semibold text-gray-800 text-xs md:text-sm">{formatMoney(item.total_ventas)}</span>
      ),
      total_costo: (
        <span className="text-gray-500 text-xs md:text-sm">{formatMoney(item.total_costo)}</span>
      ),
      ganancia: (
        <span className={`font-semibold text-xs md:text-sm ${ganancia >= 0 ? "text-green-600" : "text-red-600"}`}>
          {formatMoney(ganancia)}
        </span>
      ),
      margen: <MargenBadge margen={margen} />,
    };
  });

  // Totales para el footer
  const totalSubtotal = items.reduce((sum, i) => sum + (i.total_subtotal || 0), 0);
  const totalDescuento = items.reduce((sum, i) => sum + (i.total_descuento || 0), 0);
  const totalIva = items.reduce((sum, i) => sum + (i.total_iva || 0), 0);
  const totalVentas = items.reduce((sum, i) => sum + (i.total_ventas || 0), 0);
  const totalCosto = items.reduce((sum, i) => sum + (i.total_costo || 0), 0);
  const totalGanancia = items.reduce((sum, i) => sum + (i.ganancia_neta || 0), 0);
  const totalStock = items.reduce((sum, i) => sum + (i.cantidad_disponible || 0), 0);
  const totalVendidos = items.reduce((sum, i) => sum + (i.cantidad_vendida || 0), 0);

  // Footer en COLUMNA responsivo
  const footer = items.length > 0 && (
    <div className="border-t border-gray-200 bg-gray-50 px-2 md:px-4 py-2 md:py-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1 md:gap-y-2 text-[10px] md:text-sm">
        <div className="flex justify-between items-center gap-1">
          <span className="text-gray-500">Stock:</span>
          <span className="font-semibold text-gray-800">{formatNumber(totalStock)}</span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <span className="text-gray-500">Vendidos:</span>
          <span className="font-semibold text-gray-800">{formatNumber(totalVendidos)}</span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <span className="text-gray-500">Subtotal:</span>
          <span className="font-semibold text-gray-800">{formatMoney(totalSubtotal)}</span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <span className="text-gray-500">Desc.:</span>
          <span className="font-semibold text-red-600">{formatMoney(totalDescuento)}</span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <span className="text-gray-500">IVA:</span>
          <span className="font-semibold text-blue-600">{formatMoney(totalIva)}</span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <span className="text-gray-500">Ventas:</span>
          <span className="font-semibold text-gray-800">{formatMoney(totalVentas)}</span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <span className="text-gray-500">Costo:</span>
          <span className="font-semibold text-gray-500">{formatMoney(totalCosto)}</span>
        </div>
        <div className="flex justify-between items-center gap-1">
          <span className="text-gray-500">Ganancia:</span>
          <span className={`font-semibold ${totalGanancia >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatMoney(totalGanancia)}
          </span>
        </div>
      </div>
    </div>
  );

  if (!items.length && !loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        <i className="bi bi-box-seam text-3xl block mb-2"></i>
        Sin datos de rendimiento en el período
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
      <div className="px-2 md:px-4 py-2 md:py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <i className="bi bi-graph-up text-blue-500 text-sm md:text-base"></i>
        <span className="text-xs md:text-sm font-semibold text-gray-700">
          Rendimiento de ítems
          <span className="ml-2 text-[10px] md:text-xs bg-gray-200 text-gray-600 px-1.5 md:px-2 py-0.5 rounded-full font-normal">
            {items.length} ítems
          </span>
        </span>
      </div>

      {/* SIN overflow-x-auto - la tabla se ajusta automáticamente */}
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        empty="Sin ítems con ventas en el período"
        searchKeys={["_nombre"]}
        pageSize={10}
      />
      
      {footer}
    </div>
  );
}
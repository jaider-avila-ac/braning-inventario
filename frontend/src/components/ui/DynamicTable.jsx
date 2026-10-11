

export default function DynamicTable({
  columns = [],        // [{ key, label, width, align, render, class: "d-none" }]
  data = [],
  actions = null,      // (row, index) => JSX
  emptyText = "Sin registros",
  onRowClick = null,
  className = ""
}) {
  if (!data.length) {
    return (
      <div className="text-center py-8 text-slate-400 border border-slate-200 rounded-lg">
        {emptyText}
      </div>
    );
  }

  // Filtrar columnas visibles
  const visibleColumns = columns.filter(col => !col.hidden);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200">
            {visibleColumns.map((col, idx) => (
              <th
                key={idx}
                className={`px-3 py-2 text-xs font-semibold text-slate-500 ${col.className || ""}`}
                style={{ 
                  textAlign: col.align || "left", 
                  width: col.width 
                }}
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-3 py-2 text-xs font-semibold text-slate-500 text-center">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              {visibleColumns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className="px-3 py-2 text-slate-700"
                  style={{ textAlign: col.align || "left" }}
                >
                  {col.render ? col.render(row[col.key], row, rowIdx) : (row[col.key] ?? "—")}
                </td>
              ))}
              {actions && (
                <td className="px-3 py-2 text-center">
                  {actions(row, rowIdx)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
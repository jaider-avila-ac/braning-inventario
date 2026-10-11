import { Link } from "react-router-dom";

const headerColorClasses = {
  primary: {
    headerBg: "bg-blue-50",
    button: "text-blue-600 hover:bg-blue-100",
    title: "text-blue-800",
    border: "border-blue-200"
  },
  danger: {
    headerBg: "bg-red-50",
    button: "text-red-600 hover:bg-red-100",
    title: "text-red-800",
    border: "border-red-200"
  },
  success: {
    headerBg: "bg-green-50",
    button: "text-green-600 hover:bg-green-100",
    title: "text-green-800",
    border: "border-green-200"
  }
};

export default function PanelTable({ 
  title, 
  iconClass, 
  headerColor = "primary",
  linkText = "Ver todas",
  linkHref = "#",
  columns = [],
  data = [],
  loading = false,
  emptyText = "Sin datos",
  footer = null,
}) {
  const colors = headerColorClasses[headerColor] || headerColorClasses.primary;

  // Renderizado del Header para no repetir código
  const renderHeader = () => (
    <div className={`flex justify-between items-center px-4 py-2 border-b ${colors.border} ${colors.headerBg}`}>
      <span className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${colors.title}`}>
        <i className={`bi ${iconClass}`}></i> {title}
      </span>
      <Link to={linkHref} className={`text-xs font-medium ${colors.button} px-2 py-1 rounded transition-colors`}>
        {linkText} <i className="bi bi-arrow-right ml-1"></i>
      </Link>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {renderHeader()}
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-3 py-2 text-xs font-semibold text-gray-500 ${col.className || ""}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Estado Cargando
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                  <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              // Estado Vacío
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              // Renderizado de Datos
              data.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-3 py-2 text-gray-600 ${col.tdClassName || ""}`}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {footer && !loading && data.length > 0 && (
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 text-xs text-gray-600">
          {footer}
        </div>
      )}
    </div>
  );
}
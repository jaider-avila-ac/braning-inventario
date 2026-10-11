import { ChevronDown } from "lucide-react";

export const MobileCardView = ({ data, columns, actions, openRows, onToggleRow }) => {
  if (data.length === 0) return null;
  
  return (
    <div className="space-y-3">
      {data.map((row, idx) => {
        const rowId = row.id ?? idx;
        const isOpen = openRows[rowId];
        return (
          <div 
            key={rowId} 
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm animate-row"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            <button
              onClick={() => onToggleRow(rowId)}
              className="w-full px-4 py-3 text-left font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex justify-between items-center"
            >
              <span className="truncate">
                {columns[0]?.render ? columns[0].render(row[columns[0].key], row) : (row[columns[0].key] ?? "—")}
              </span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="px-4 pb-3 pt-1 border-t border-gray-100">
                {columns.slice(1).map((col) => (
                  <div key={col.key} className="flex py-2 border-b border-gray-100 last:border-0">
                    <span className="w-1/2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{col.label}:</span>
                    <span className="w-1/2 text-sm text-gray-700 break-words text-right">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </span>
                  </div>
                ))}
                {actions && (
                  <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-50">
                    {actions(row)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
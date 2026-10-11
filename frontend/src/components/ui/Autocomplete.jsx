import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Plus } from "lucide-react";

export default function Autocomplete({
  value,
  onChange,
  onSelect,
  onClear,
  fetchItems,
  placeholder = "Buscar...",
  createHref = null,
  disabled = false,
  className = "",
}) {
  const [query, setQuery] = useState(value || "");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const timerRef = useRef(null);
  const isInternalChangeRef = useRef(false);

  // Actualizar query cuando cambia value desde fuera (SOLO si el cambio viene de fuera)
  useEffect(() => {
    if (!isInternalChangeRef.current && value !== query && !selectedItem) {
      setQuery(value || "");
    }
    isInternalChangeRef.current = false;
  }, [value, query, selectedItem]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const searchItems = useCallback(async (search) => {
    if (!search || search.length < 2) {
      setItems([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      const results = await fetchItems(search);
      setItems(results);
      setShowDropdown(results.length > 0);
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchItems]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    isInternalChangeRef.current = true;
    setQuery(newValue);
    setSelectedItem(null);
    if (onChange) onChange(newValue);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      searchItems(newValue);
    }, 300);
  };

  const handleSelect = (item) => {
    isInternalChangeRef.current = true;
    setQuery(item._label);
    setSelectedItem(item);
    setShowDropdown(false);
    if (onSelect) onSelect(item);
  };

  const handleClear = () => {
    isInternalChangeRef.current = true;
    setQuery("");
    setSelectedItem(null);
    if (onClear) onClear();
    if (onChange) onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length >= 2 && items.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled ? "bg-slate-100 text-slate-500" : ""
          }`}
        />
        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-slate-400">Buscando...</div>
          ) : items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">Sin resultados</div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0"
              >
                <div className="font-medium text-slate-700">{item._label}</div>
                {item.num_documento && (
                  <div className="text-xs text-slate-400">{item.num_documento}</div>
                )}
              </button>
            ))
          )}
          {createHref && (
            <>
              <div className="border-t border-slate-200 my-1" />
              <a
                href={createHref}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Plus size={14} />
                Crear nuevo
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";

/**
 * SearchSelect — two modes:
 *   Static:  pass `items` array, filters locally.
 *   Async:   pass `onSearch(query) => Promise<{id,label,...}[]>`.
 *            Shows all results on focus, re-searches as you type (debounced 250ms).
 *
 * `onSelectItem(item)` — optional callback with the full item object when selected.
 * `items` — used as fallback to display the label of the already-selected value
 *            (e.g. when editing an existing record and asyncItems is still empty).
 */
export default function SearchSelect({
  items = [],
  onSearch = null,
  onSelectItem = null,
  value,
  onChange,
  placeholder = "Buscar...",
  label,
  required = false,
  disabled = false,
  error = false,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [asyncItems, setAsyncItems] = useState([]);
  const [searching, setSearching] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const lastQuery = useRef(null);

  const displayList = onSearch
    ? asyncItems
    : query && !value
      ? items.filter(it => it.label.toLowerCase().includes(query.toLowerCase()))
      : items;

  // Find selected item: check async results first, then the static fallback items list
  const selected =
    displayList.find(it => it.id === value) ??
    asyncItems.find(it => it.id === value) ??
    items.find(it => it.id === value) ??
    null;

  const isLocked = !!selected;
  const inputValue = isLocked ? (selected.label ?? "") : query;

  const runSearch = useCallback(async (q) => {
    if (!onSearch) return;
    if (lastQuery.current === q) return;
    lastQuery.current = q;
    setSearching(true);
    try {
      const results = await onSearch(q);
      setAsyncItems(results ?? []);
    } catch {
      setAsyncItems([]);
    } finally {
      setSearching(false);
    }
  }, [onSearch]);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    if (isLocked) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setOpen(true);
    if (onSearch) runSearch(query || "");
  }, [disabled, isLocked, onSearch, query, runSearch]);

  useEffect(() => {
    const handler = (e) => {
      const inWrapper = wrapperRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inWrapper && !inDropdown) {
        setOpen(false);
        if (!value) setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      // Don't close if scrolling within the dropdown itself
      if (dropdownRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open]);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    if (value) onChange(null);
    if (!open) openDropdown();

    if (onSearch) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runSearch(q), 250);
    }
  };

  const handleSelect = (item) => {
    onChange(item.id);
    if (onSelectItem) onSelectItem(item);
    setQuery("");
    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    if (onSelectItem) onSelectItem(null);
    setOpen(false);
    lastQuery.current = null;
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={openDropdown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={isLocked}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"
          } ${isLocked && !disabled ? "bg-gray-50 pr-8 cursor-default" : error ? "bg-red-50" : ""}`}
        />
        {isLocked && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Limpiar selección"
          >
            <X size={14} />
          </button>
        )}
        {!isLocked && searching && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Loader2 size={14} className="animate-spin" />
          </div>
        )}
      </div>

      {open && !isLocked && !disabled && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto"
        >
          {searching ? (
            <p className="px-3 py-2 text-sm text-gray-400 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin" /> Buscando...
            </p>
          ) : displayList.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
          ) : (
            displayList.map(item => (
              <button
                key={item.id}
                type="button"
                onMouseDown={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
              >
                {item.label}
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

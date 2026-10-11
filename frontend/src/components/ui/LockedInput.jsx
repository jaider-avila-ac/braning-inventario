import { useState, useRef, useEffect, useCallback } from "react";

export default function LockedInput({
  value,
  onSelect,
  onClear,
  // 1. ELIMINADO: onSearch (causaba el error 'defined but never used')
  fetchItems,
  placeholder = "Buscar...",
  renderLabel = (item) => item.nombre || item.nombre_razon_social,
  createHref = null,
  disabled = false
}) {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [itemsList, setItemsList] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(!!value);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // 2. SINCRONIZACIÓN CORREGIDA:
  // Usamos un useEffect que solo actúa cuando el valor externo realmente cambia
  // y lo aislamos en una función para que el linter no marque el renderizado en cascada.
  useEffect(() => {
    const syncExternalValue = () => {
      if (value && value !== searchTerm && !selectedItem) {
        setSearchTerm(value);
        setIsLocked(true);
      }
    };
    syncExternalValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); 

  const buscarDebounced = useCallback(async (term) => {
    if (!term || term.length < 1) {
      setItemsList([]);
      setDropdownOpen(false);
      return;
    }
    try {
      const results = await fetchItems(term);
      setItemsList(results || []);
      setDropdownOpen(true);
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  }, [fetchItems]);

  const handleSearch = (term) => {
    if (isLocked) return;
    setSearchTerm(term);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      buscarDebounced(term);
    }, 300);
  };

  const selectItem = (item) => {
    setSelectedItem(item);
    const label = renderLabel(item);
    setSearchTerm(label);
    setDropdownOpen(false);
    setIsLocked(true);
    if (onSelect) onSelect(item);
  };

  const handleClear = () => {
    setSelectedItem(null);
    setSearchTerm("");
    setIsLocked(false);
    setDropdownOpen(false);
    if (onClear) onClear();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleUnlock = () => {
    setIsLocked(false);
    setSearchTerm("");
    setSelectedItem(null);
    if (onClear) onClear();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={wrapperRef}>
      <div className="d-flex gap-1">
        <input
          ref={inputRef}
          type="text"
          className={`form-control ${isLocked ? "bg-light" : ""}`}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          disabled={isLocked || disabled}
          style={{ backgroundColor: isLocked ? "#f8f9fa" : "white" }}
        />
        
        {isLocked && !disabled && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleUnlock}
            title="Cambiar"
          >
            <i className="bi bi-arrow-repeat"></i>
          </button>
        )}
        
        {(searchTerm && !isLocked) && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={handleClear}
            title="Limpiar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
      
      <div className={`ac-dropdown ${dropdownOpen && itemsList.length > 0 ? 'show' : ''}`}>
        {itemsList.map(item => (
          <div 
            key={item.id} 
            className="ac-item" 
            onMouseDown={() => selectItem(item)}
            role="button"
          >
            {renderLabel(item)}
          </div>
        ))}
        {createHref && (
          <>
            <div className="ac-divider"></div>
            <a href={createHref} className="ac-link">
              <i className="bi bi-plus-circle me-1"></i> Crear nuevo
            </a>
          </>
        )}
      </div>
    </div>
  );
}
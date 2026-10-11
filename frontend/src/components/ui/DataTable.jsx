import { useState, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { MobileCardView } from "./DataTable/MobileCardView";
import { DesktopTableView } from "./DataTable/DesktopTableView";
import { Pagination } from "./DataTable/Pagination";

const PAGE_SIZE = 10;

export default function DataTable({
  columns = [],
  rows = [],
  actions,
  empty = "Sin registros.",
  loading = false,
  defaultSort,
  searchKeys = [],
  pageSize = PAGE_SIZE,
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(defaultSort ?? null);
  const [page, setPage] = useState(1);
  const [openRows, setOpenRows] = useState({});
  
  // Detectar si es móvil (menor a 1024px)
  const isMobile = useMediaQuery("(max-width: 1023px)");

  // Filtrar datos
  const filteredData = useMemo(() => {
    if (!query.trim() || !searchKeys.length) return rows;
    const q = query.toLowerCase();
    return rows.filter(row =>
      searchKeys.some(key => String(row[key] ?? "").toLowerCase().includes(q))
    );
  }, [rows, query, searchKeys]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sort) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = String(a[sort.key] ?? "").toLowerCase();
      const valB = String(b[sort.key] ?? "").toLowerCase();
      if (valA < valB) return sort.dir === "asc" ? -1 : 1;
      if (valA > valB) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sort]);

  // Paginar datos
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedData = sortedData.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key) => {
    setPage(1);
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const handleSearch = (value) => {
    setQuery(value);
    setPage(1);
  };

  const toggleRow = (id) => {
    setOpenRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const changePage = (newPage) => {
    setPage(newPage);
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Mostrar vacío
  if (sortedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p>{query ? "No se encontraron resultados." : empty}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Búsqueda */}
      {searchKeys.length > 0 && (
        <div className="mb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar..."
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Renderizar SOLO UNO según el tamaño de pantalla */}
      {isMobile ? (
        <MobileCardView
          data={paginatedData}
          columns={columns}
          actions={actions}
          openRows={openRows}
          onToggleRow={toggleRow}
        />
      ) : (
        <DesktopTableView
          data={paginatedData}
          columns={columns}
          actions={actions}
          sort={sort}
          onToggleSort={handleSort}
        />
      )}

      {/* Paginación */}
      {sortedData.length > pageSize && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={changePage}
          totalItems={sortedData.length}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}
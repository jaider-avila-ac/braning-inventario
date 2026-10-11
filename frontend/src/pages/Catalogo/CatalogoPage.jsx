import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Package, Box, Wrench, ShoppingCart, History } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import DataTable from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/DataTable/Pagination";
import { useCatalogo } from "./useCatalogo";
import { useAuth } from "../../context/AuthContext";

const TIPOS = [
  { value: "", label: "Todos" },
  { value: "PRODUCTO", label: "Producto" },
  { value: "SERVICIO", label: "Servicio" },
  { value: "INSUMO", label: "Insumo" },
];

const TIPO_STYLES = {
  PRODUCTO: "bg-blue-100 text-blue-700",
  SERVICIO: "bg-purple-100 text-purple-700",
  INSUMO: "bg-amber-100 text-amber-700",
};

const COLUMNS = [
  { key: "nombre", label: "Item", sortable: true },
  { key: "tipo_badge", label: "Tipo", sortable: true, align: "center" },
  { key: "stock", label: "Stock", sortable: true, align: "right" },
  { key: "stock_minimo", label: "Mínimo", sortable: true, align: "right" },
  { key: "controla_badge", label: "Controla Inv.", sortable: true, align: "center" },
  { key: "precio_venta", label: "Precio venta", sortable: true, align: "right" },
];

export default function CatalogoPage() {
  const { perfil } = useAuth();
  const isAdmin = ["SUPER_ADMIN", "EMPRESA_ADMIN"].includes(perfil?.rol);

  const {
    items,
    loading,
    error,
    pagination,
    search,
    setSearch,
    tipo,
    setTipo,
    soloControla,
    setSoloControla,
    handleDelete,
    changePage,
    reload,
  } = useCatalogo();

  const renderTipo = (tipo) => {
    const Icon = tipo === "PRODUCTO" ? Package : tipo === "SERVICIO" ? Wrench : Box;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${TIPO_STYLES[tipo] || "bg-gray-100 text-gray-600"}`}>
        <Icon size={12} />
        {tipo}
      </span>
    );
  };

  const renderControlaInventario = (controla) => {
    if (controla) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Sí</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">No</span>;
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const rows = items.map(item => ({
    id: item.id,
    nombre: (
      <div>
        <div className="font-semibold text-gray-800">{item.nombre || "—"}</div>
        {item.descripcion && <div className="text-xs text-gray-400 truncate max-w-50">{item.descripcion}</div>}
      </div>
    ),
    tipo_badge: renderTipo(item.tipo),
    stock: item.inventario?.unidades_actuales?.toLocaleString() || "0",
    stock_minimo: item.controla_inventario ? (item.inventario?.unidades_minimas?.toLocaleString() || "0") : "—",
    controla_badge: renderControlaInventario(item.controla_inventario),
    precio_venta: formatMoney(item.precio_venta_sugerido),
  }));

  const onDelete = (row) => {
    handleDelete(row.id, row.nombre.props.children[0]?.props?.children || "item");
  };

  const renderAcciones = isAdmin ? (row) => (
    <div className="flex items-center gap-1">
      <Link to={`/catalogo/editar/${row.id}`}>
        <IconButton icon={Pencil} title="Editar" variant="warning" />
      </Link>
      <IconButton
        icon={Trash2}
        title="Eliminar"
        variant="danger"
        onClick={() => onDelete(row)}
      />
    </div>
  ) : null;

  const startItem = pagination.total > 0 ? (pagination.currentPage - 1) * pagination.perPage + 1 : 0;
  const endItem = Math.min(pagination.currentPage * pagination.perPage, pagination.total);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center text-red-500">
          <Package className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-semibold mt-2">Error al cargar el catálogo</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={reload} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Catálogo</h2>
          <p className="text-sm text-gray-400">Gestión de productos, servicios e insumos</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <Link
              to="/compras"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <ShoppingCart size={18} /> Compras
            </Link>
            <Link
              to="/inventario/movimientos"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <History size={18} /> Movimientos
            </Link>
            <Link
              to="/catalogo/nuevo"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={18} /> Nuevo item
            </Link>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            {TIPOS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={soloControla}
            onChange={(e) => setSoloControla(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="0">Todos</option>
            <option value="1">Solo con inventario</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabla */}
        <div className="overflow-auto" style={{ height: 500 }}>
          <DataTable
            columns={COLUMNS}
            rows={rows}
            actions={renderAcciones}
            loading={loading}
            empty="No hay items registrados en el catálogo."
            defaultSort={{ key: "nombre", dir: "asc" }}
            pageSize={pagination.perPage}
            hidePagination={true}
          />
        </div>
        
        {/* Paginación */}
        {pagination.total > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-sm text-gray-500">
                Mostrando {startItem} - {endItem} de {pagination.total} registros
              </span>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.lastPage}
                onPageChange={changePage}
                totalItems={pagination.total}
                pageSize={pagination.perPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
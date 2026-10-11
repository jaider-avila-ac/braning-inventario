import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import DataTable from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/DataTable/Pagination";
import ImportDropdownButton from "../../components/ui/ImportDropdownButton";
import ImportProgressModal from "../../utils/ImportProgressModal";
import { useProveedores } from "./useProveedores";
import { importarProveedores } from "../../services/proveedores.service";
import { descargarPlantillaProveedores } from "../../utils/xlsxTemplate";

const COLUMNS = [
  { key: "nombre", label: "Nombre", sortable: true },
  { key: "nit", label: "NIT", sortable: true },
  { key: "contacto", label: "Contacto", sortable: true },
  { key: "telefono", label: "Teléfono", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "estado_badge", label: "Estado", sortable: true, align: "center" },
];

const ESTADO_STYLES = {
  true: "bg-green-100 text-green-700",
  false: "bg-red-100 text-red-700",
};

const IMPORT_INITIAL = { phase: "idle", file: null, progress: 0, successCount: 0, errors: [] };

export default function ProveedoresPage() {
  const {
    proveedores, loading, error, pagination,
    search, setSearch, activos, setActivos,
    handleDelete, changePage, reload,
  } = useProveedores();

  const [importState, setImportState] = useState(IMPORT_INITIAL);

  const renderEstado = (activo) => {
    const isActivo = activo === true || activo === 1 || activo === "1";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_STYLES[isActivo]}`}>
        {isActivo ? "Activo" : "Inactivo"}
      </span>
    );
  };

  const onDelete = (row) => handleDelete(row.id, row.nombre);

  const handleFileSelected = (file) => {
    setImportState({ ...IMPORT_INITIAL, phase: "selected", file });
  };

  const handleImportConfirm = async (file) => {
    setImportState(s => ({ ...s, phase: "uploading", progress: 0 }));
    try {
      const result = await importarProveedores(file, {
        onUploadProgress: (pct) => setImportState(s => ({ ...s, progress: pct })),
        onProcessing: () => setImportState(s => ({ ...s, phase: "processing" })),
      });
      setImportState(s => ({ ...s, phase: "success", successCount: result.importados }));
      reload();
    } catch (err) {
      setImportState(s => ({ ...s, phase: "error", errors: err?.data?.errores || [] }));
    }
  };

  const handleImportClose = () => setImportState(IMPORT_INITIAL);

  const startItem = pagination.total > 0 ? (pagination.currentPage - 1) * pagination.perPage + 1 : 0;
  const endItem = Math.min(pagination.currentPage * pagination.perPage, pagination.total);

  const rows = proveedores.map(p => ({
    id: p.id,
    nombre: p.nombre || "—",
    nit: p.nit || "—",
    contacto: p.contacto || "—",
    telefono: p.telefono || "—",
    email: p.email || "—",
    estado_badge: renderEstado(p.is_activo ?? p.activo ?? true),
    nombre_plain: p.nombre || "—",
  }));

  const renderAcciones = (row) => (
    <div className="flex items-center gap-1">
      <Link to={`/proveedores/editar/${row.id}`}>
        <IconButton icon={Pencil} title="Editar" variant="warning" />
      </Link>
      <IconButton
        icon={Trash2}
        title="Eliminar"
        variant="danger"
        onClick={() => onDelete({ id: row.id, nombre: row.nombre_plain })}
      />
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-red-500">
        <p className="text-lg font-semibold mt-2">Error al cargar proveedores</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={reload} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Proveedores</h2>
          <p className="text-sm text-gray-400">Gestión de proveedores del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportDropdownButton
            label="Importar"
            onImport={handleFileSelected}
            onDownloadTemplate={descargarPlantillaProveedores}
          />
          <Link
            to="/proveedores/nuevo"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} /> Nuevo proveedor
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, NIT, contacto o email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div>
          <select
            value={activos}
            onChange={(e) => setActivos(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
            <option value="">Todos</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-auto" style={{ height: 500 }}>
          <DataTable
            columns={COLUMNS}
            rows={rows}
            actions={renderAcciones}
            loading={loading}
            empty="No hay proveedores registrados."
            defaultSort={{ key: "nombre", dir: "asc" }}
            pageSize={pagination.perPage}
            hidePagination={true}
          />
        </div>
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

      <ImportProgressModal
        isOpen={importState.phase !== "idle"}
        onClose={handleImportClose}
        phase={importState.phase}
        file={importState.file}
        progress={importState.progress}
        successCount={importState.successCount}
        errors={importState.errors}
        onConfirm={handleImportConfirm}
        onFileChange={handleFileSelected}
        entityName="proveedores"
      />
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Receipt } from "lucide-react";
import { IconButton } from "../../components/ui/IconButton";
import DataTable from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/DataTable/Pagination";
import ImportDropdownButton from "../../components/ui/ImportDropdownButton";
import ImportProgressModal from "../../utils/ImportProgressModal";
import { useClientes } from "./useClientes";
import { showConfirm, showToast } from "../../utils/notifications";
import { formatMoney } from "../../services/dashboard.service";
import { importarClientes } from "../../services/clientes.service";
import { descargarPlantillaClientes } from "../../utils/xlsxTemplate";

const COLUMNS = [
  { key: "nombre_completo", label: "Cliente", sortable: true },
  { key: "documento", label: "Documento", sortable: true },
  { key: "telefono", label: "Teléfono", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "saldo_formateado", label: "Saldo a favor", sortable: true, align: "right" },
];

const IMPORT_INITIAL = { phase: "idle", file: null, progress: 0, successCount: 0, errors: [] };

export default function ClientesPage() {
  const {
    clientes, loading, error, pagination,
    search, setSearch, handleDelete, changePage, reload,
  } = useClientes();

  const [importState, setImportState] = useState(IMPORT_INITIAL);

  const formatSaldo = (saldo) => {
    const saldoNum = saldo || 0;
    if (saldoNum > 0) return <span className="text-emerald-600 font-semibold">{formatMoney(saldoNum)}</span>;
    return <span className="text-gray-400">—</span>;
  };

  const onDelete = async (row) => {
    const confirmed = await showConfirm(
      `¿Eliminar a <strong>${row.nombre_razon_social}</strong>? Esta acción no se puede deshacer.`,
      { title: "Eliminar cliente", okLabel: "Sí, eliminar" }
    );
    if (confirmed) {
      const result = await handleDelete(row.id, row.nombre_razon_social);
      if (result.success) showToast("Cliente eliminado correctamente", "success");
    }
  };

  const handleFileSelected = (file) => {
    setImportState({ ...IMPORT_INITIAL, phase: "selected", file });
  };

  const handleImportConfirm = async (file) => {
    setImportState(s => ({ ...s, phase: "uploading", progress: 0 }));
    try {
      const result = await importarClientes(file, {
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

  const rows = clientes.map(c => ({
    id: c.id,
    nombre_completo: (
      <div>
        <div className="font-semibold text-gray-800">{c.empresa || c.nombre_razon_social}</div>
        {c.empresa && <div className="text-xs text-gray-400">{c.nombre_razon_social}</div>}
      </div>
    ),
    documento: c.tipo_documento && c.num_documento ? `${c.tipo_documento} ${c.num_documento}` : "—",
    telefono: c.telefono || "—",
    email: c.email || "—",
    saldo_formateado: formatSaldo(c.saldo_a_favor),
    nombre_razon_social: c.nombre_razon_social,
  }));

  const renderAcciones = (row) => (
    <div className="flex items-center gap-1">
      <Link to={`/clientes/facturas/${row.id}`}>
        <IconButton icon={Receipt} title="Ver facturas" variant="info" />
      </Link>
      <Link to={`/clientes/editar/${row.id}`}>
        <IconButton icon={Pencil} title="Editar" variant="warning" />
      </Link>
      <IconButton
        icon={Trash2}
        title="Eliminar"
        variant="danger"
        onClick={() => onDelete({ id: row.id, nombre_razon_social: row.nombre_razon_social })}
      />
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-red-500">
        <p className="text-lg font-semibold mt-2">Error al cargar clientes</p>
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
          <h2 className="text-xl font-bold text-gray-800">Clientes</h2>
          <p className="text-sm text-gray-400">Gestión de clientes del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportDropdownButton
            label="Importar"
            onImport={handleFileSelected}
            onDownloadTemplate={descargarPlantillaClientes}
          />
          <Link
            to="/clientes/nuevo"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} /> Nuevo cliente
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-auto" style={{ height: 500 }}>
          <DataTable
            columns={COLUMNS}
            rows={rows}
            actions={renderAcciones}
            loading={loading}
            empty="No hay clientes registrados."
            defaultSort={{ key: "nombre_completo", dir: "asc" }}
            searchKeys={[]}
            pageSize={pagination.perPage}
            hidePagination={true}
          />
        </div>
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          {pagination.total > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.lastPage}
              onPageChange={changePage}
              totalItems={pagination.total}
              pageSize={pagination.perPage}
            />
          )}
        </div>
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
        entityName="clientes"
      />
    </div>
  );
}

import DataTable from "./DataTable";
import { formatMoney } from "../../services/dashboard.service";

const ALL_COLUMNS = [
  { key: "numero",            label: "Número",          sortable: true },
  { key: "vendedor",          label: "Vendedor",         sortable: true },
  { key: "cliente_nombre",    label: "Cliente",          sortable: true },
  { key: "estado_badge",      label: "Estado",           sortable: true, align: "center" },
  { key: "fecha",             label: "Fecha",            sortable: true },
  { key: "total_formateado",  label: "Total",            sortable: true, align: "right" },
  { key: "pagado_formateado", label: "Valor pagado",     sortable: true, align: "right" },
  { key: "saldo_formateado",  label: "Saldo pendiente",  sortable: true, align: "right" },
];

const ESTADO_STYLES = {
  BORRADOR: "bg-gray-100 text-gray-600",
  EMITIDA:  "bg-emerald-100 text-emerald-600",
  ANULADA:  "bg-red-100 text-red-600",
};

const nombreUsuario = (u) => {
  if (!u) return null;
  const n = u.nombre_completo
    || [u.nombres, u.apellidos].filter(Boolean).join(" ").trim();
  return n || u.email || null;
};

export default function FacturasTable({
  facturas = [],
  hideColumns = [],
  actions,
  loading,
  empty,
  pageSize = 10,
  defaultSort = { key: "fecha", dir: "desc" },
}) {
  const columns = ALL_COLUMNS.filter(c => !hideColumns.includes(c.key));

  const rows = facturas.map(f => {
    const total    = parseFloat(f.total)        || 0;
    const pagado   = parseFloat(f.total_pagado)  || 0;
    const saldo    = parseFloat(f.saldo)         || 0;
    const vendedor = nombreUsuario(f.usuario);
    const anulador = nombreUsuario(f.anulado_por);
    const anulada  = f.estado === "ANULADA";

    return {
      id: f.id,
      _raw: f,

      numero: f.estado === "BORRADOR" ? (
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Borrador</span>
      ) : anulada && !f.numero ? (
        <span className="text-xs font-medium text-red-400 uppercase tracking-wide">Anulada</span>
      ) : (
        <span className="font-mono font-medium text-blue-600">{f.numero || `#${f.id}`}</span>
      ),

      vendedor: vendedor
        ? <span className="text-xs text-gray-500 leading-tight">{vendedor}</span>
        : <span className="text-xs text-gray-300">—</span>,

      cliente_nombre: (
        <div className="font-semibold text-gray-800">
          {f.cliente?.nombre_razon_social || "—"}
        </div>
      ),

      estado_badge: anulada ? (
        <div className="flex flex-col items-center gap-0.5">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_STYLES.ANULADA}`}>
            ANULADA
          </span>
          {anulador && (
            <span className="text-xs text-gray-400 whitespace-nowrap">por: {anulador}</span>
          )}
        </div>
      ) : (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_STYLES[f.estado] || ESTADO_STYLES.BORRADOR}`}>
          {f.estado}
        </span>
      ),

      fecha: f.fecha?.substring(0, 10) || "—",

      total_formateado: (
        <span className="font-semibold text-gray-900">{formatMoney(total)}</span>
      ),

      pagado_formateado: anulada ? (
        <span className="text-xs text-gray-400">—</span>
      ) : pagado > 0 ? (
        <span className="font-semibold text-emerald-600">{formatMoney(pagado)}</span>
      ) : (
        <span className="text-xs text-gray-400">$0</span>
      ),

      saldo_formateado: anulada ? (
        <span className="text-xs text-gray-400">—</span>
      ) : saldo > 0 ? (
        <span className="font-semibold text-amber-600">{formatMoney(saldo)}</span>
      ) : (
        <span className="text-xs text-emerald-600 font-medium">Pagada</span>
      ),

      estado_raw: f.estado,
      saldo_raw:  saldo,
    };
  });

  return (
    <DataTable
      columns={columns}
      rows={rows}
      actions={actions}
      loading={loading}
      empty={empty || "No hay facturas registradas."}
      defaultSort={defaultSort}
      pageSize={pageSize}
    />
  );
}

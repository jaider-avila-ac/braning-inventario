import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Search, Eye, DollarSign } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import FacturasTable from "../../components/ui/FacturasTable";
import CobroModalUnificado from "../../components/ui/CobroModalUnificado";
import { facturasPendientes } from "../../services/facturas.service";
import { formatMoney } from "../../services/dashboard.service";
import { showToast } from "../../utils/notifications";
import { useAuth } from "../../context/AuthContext";
import { getCached, setCached } from "../../utils/pageCache";

const CACHE_KEY = "facturas-pendientes";

export default function FinanzasPendientesPage() {
  const { perfil } = useAuth();
  const isAdmin = ["SUPER_ADMIN", "EMPRESA_ADMIN"].includes(perfil?.rol);

  const cached = getCached(CACHE_KEY);

  const [facturas, setFacturas] = useState(cached ?? []);
  // Solo muestra skeleton si no hay caché y no hay búsqueda activa
  const [loading, setLoading] = useState(!cached);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isFirstLoad = useRef(true);

  const loadFacturas = useCallback(async (silent = false) => {
    if (!isMountedRef.current) return;
    if (!silent) setLoading(true);
    try {
      const data = await facturasPendientes({ search });
      if (isMountedRef.current) {
        const rows = data.data || [];
        setFacturas(rows);
        // Solo cachear cuando no hay búsqueda activa
        if (!search) setCached(CACHE_KEY, rows);
      }
    } catch (error) {
      if (isMountedRef.current) showToast(error.message, "error");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    // Primera carga: silenciosa si hay caché, con skeleton si no
    // Búsquedas posteriores: siempre silenciosas (ya hay datos en pantalla)
    const silent = isFirstLoad.current ? !!cached : true;
    if (isFirstLoad.current) isFirstLoad.current = false;
    debounceTimerRef.current = setTimeout(() => loadFacturas(silent), search ? 300 : 0);
    return () => clearTimeout(debounceTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, loadFacturas]);

  const handleCobrar = (row) => {
    setFacturaSeleccionada(row._raw);
    setModalOpen(true);
  };

  const handlePagoOk = async () => {
    setModalOpen(false);
    setFacturaSeleccionada(null);
    await loadFacturas(true);
  };

  const renderAcciones = (row) => (
    <div className="flex items-center gap-1">
      <Link to={`/facturas/ver/${row.id}`}>
        <IconButton icon={Eye} title="Ver" variant="info" />
      </Link>
      <IconButton
        icon={DollarSign}
        title="Registrar pago"
        variant="success"
        onClick={() => handleCobrar(row)}
      />
    </div>
  );

  const totalSaldoPendiente = facturas.reduce((sum, f) => {
    if (f.estado === 'ANULADA') return sum;
    return sum + (parseFloat(f.saldo) || 0);
  }, 0);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-hourglass text-red-500"></i>
            Saldos pendientes
          </h1>
          <p className="text-sm text-gray-500">Facturas con saldo pendiente de cobro (borradores y emitidas)</p>
        </div>
        <Link to={isAdmin ? "/finanzas" : "/dashboard"}>
          <Button text={isAdmin ? "Volver a finanzas" : "Volver al dashboard"} icon={ArrowLeft} variant="outline" />
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Número de factura o cliente..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button text="Refrescar" icon={RefreshCw} variant="outline" onClick={() => loadFacturas(true)} disabled={loading} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <FacturasTable
          facturas={facturas}
          actions={renderAcciones}
          loading={loading}
          empty={
            <div className="text-center py-8">
              <i className="bi bi-check2-circle text-green-500 text-3xl block mb-2"></i>
              <p className="text-gray-500">Sin facturas pendientes. ¡Todo al día!</p>
            </div>
          }
          pageSize={10}
        />

        {facturas.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
            <div className="flex justify-end gap-6 text-sm">
              <div className="flex gap-2 items-center">
                <span className="text-gray-500">Total saldo pendiente →</span>
                <span className="text-red-600 font-semibold min-w-32.5 text-right">
                  {formatMoney(totalSaldoPendiente)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <CobroModalUnificado
        key={facturaSeleccionada?.id ?? 0}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setFacturaSeleccionada(null); }}
        onPagoOk={handlePagoOk}
        factura={facturaSeleccionada}
      />
    </div>
  );
}

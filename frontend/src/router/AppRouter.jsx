import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ClientesPage from "../pages/Clientes/ClientesPage";
import ClienteFormPage from "../pages/Clientes/ClienteFormPage";
import CotizacionesPage from "../pages/Cotizaciones/CotizacionesPage";
import CotizacionFormPage from "../pages/Cotizaciones/CotizacionFormPage";
import CotizacionViewPage from "../pages/Cotizaciones/CotizacionViewPage";
import FacturasPage from "../pages/Facturas/FacturasPage";
import FacturaFormPage from "../pages/Facturas/FacturaFormPage";
import FacturaViewPage from "../pages/Facturas/FacturaViewPage";
import FinanzasPage from "../pages/Finanzas/FinanzasPage";
import FinanzasPendientesPage from "../pages/Finanzas/FinanzasPendientesPage";
import FinanzasCobroFactura from "../pages/Finanzas/FinanzasCobroFactura";
import ProveedoresPage from "../pages/Proveedores/ProveedoresPage";
import ProveedorFormPage from "../pages/Proveedores/ProveedorFormPage";
import VentaRapidaPage from "../pages/VentaRapida/VentaRapidaPage";
import IngresosPage from "../pages/Finanzas/IngresosPage";
import ReportesPage from "../pages/Reportes/ReportesPage";
import UsuariosPage from "../pages/Ajustes/UsuariosPage";
import EgresosPage from "../pages/Finanzas/EgresosPage";
import EmpresaFormPage from "../pages/Empresa/EmpresaFormPage";
import UsuarioFormPage from "../pages/Ajustes/UsuarioFormPage";
import BrevoPage from "../pages/Ajustes/BrevoPage";
import ClienteFacturasPage from "../pages/Clientes/ClienteFacturasPage";
import AuditoriaPage from "../pages/Ajustes/AuditoriaPage";
import CatalogoPage from "../pages/Catalogo/CatalogoPage";
import CatalogoFormPage from "../pages/Catalogo/CatalogoFormPage";
import ComprasPage from "../pages/Compras/ComprasPage";
import MovimientosPage from "../pages/Inventario/MovimientosPage";
import FacturaLibreFormPage from "../pages/Facturas/FacturaLibreFormPage";
import CotizacionLibreFormPage from "../pages/Cotizaciones/CotizacionLibreFormPage";
import EmpresaPage from "../pages/Empresa/EmpresaPage";

const ADMIN_ROLES = ["SUPER_ADMIN", "EMPRESA_ADMIN"];

function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <i className="bi bi-shield-lock" style={{ fontSize: "4rem", color: "#f87171" }}></i>
      <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Acceso denegado</h2>
      <p className="text-gray-500 mb-6">No tienes permisos para acceder a esta página.</p>
      <Link
        to="/dashboard"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

function RoleGuard({ allowedRoles, children }) {
  const { perfil } = useAuth();
  if (!perfil) return null;
  return allowedRoles.includes(perfil.rol) ? children : <Unauthorized />;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Clientes */}
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="clientes/nuevo" element={<ClienteFormPage />} />
        <Route path="clientes/editar/:id" element={<ClienteFormPage />} />
        <Route path="clientes/facturas/:id" element={<ClienteFacturasPage />} />

        {/* Proveedores */}
        <Route path="proveedores" element={<ProveedoresPage />} />
        <Route path="proveedores/nuevo" element={<ProveedorFormPage />} />
        <Route path="proveedores/editar/:id" element={<ProveedorFormPage />} />

        {/* Cotizaciones */}
        <Route path="cotizaciones" element={<CotizacionesPage />} />
        <Route path="cotizaciones/nueva" element={<CotizacionFormPage />} />
        <Route path="cotizaciones/editar/:id" element={<CotizacionFormPage />} />
        <Route path="cotizaciones/ver/:id" element={<CotizacionViewPage />} />
        <Route path="cotizaciones/nueva-libre" element={<CotizacionLibreFormPage />} />
        <Route path="cotizaciones/editar-libre/:id" element={<CotizacionLibreFormPage />} />

        {/* Facturas */}
        <Route path="facturas" element={<FacturasPage />} />
        <Route path="facturas/nueva" element={<FacturaFormPage />} />
        <Route path="facturas/editar/:id" element={<FacturaFormPage />} />
        <Route path="facturas/ver/:id" element={<FacturaViewPage />} />
        <Route path="facturas/nueva-libre" element={<FacturaLibreFormPage />} />
        <Route path="facturas/editar-libre/:id" element={<FacturaLibreFormPage />} />

        {/* Finanzas — Pendientes accesible para todos */}
        <Route path="finanzas/pendientes" element={<FinanzasPendientesPage />} />

        {/* Catálogo — lectura para todos, escritura solo admin */}
        <Route path="catalogo" element={<CatalogoPage />} />
        <Route path="catalogo/nuevo" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><CatalogoFormPage /></RoleGuard>
        } />
        <Route path="catalogo/editar/:id" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><CatalogoFormPage /></RoleGuard>
        } />

        {/* Venta rápida */}
        <Route path="venta-rapida" element={<VentaRapidaPage />} />

        {/* ── Rutas solo ADMIN ─────────────────────────────────────────────── */}
        <Route path="finanzas" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><FinanzasPage /></RoleGuard>
        } />
        <Route path="finanzas/ingresos" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><IngresosPage /></RoleGuard>
        } />
        <Route path="finanzas/egresos" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><EgresosPage /></RoleGuard>
        } />
        <Route path="finanzas/cobro-rapido" element={<FinanzasCobroFactura />} />

        <Route path="reportes" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><ReportesPage /></RoleGuard>
        } />

        <Route path="empresa" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><EmpresaPage /></RoleGuard>
        } />
        <Route path="empresas/nueva" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><EmpresaFormPage /></RoleGuard>
        } />

        <Route path="compras" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><ComprasPage /></RoleGuard>
        } />
        <Route path="inventario/movimientos" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><MovimientosPage /></RoleGuard>
        } />

        <Route path="ajustes/usuarios" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><UsuariosPage /></RoleGuard>
        } />
        <Route path="ajustes/usuario-form" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><UsuarioFormPage /></RoleGuard>
        } />
        <Route path="ajustes/usuario-form/:id" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><UsuarioFormPage /></RoleGuard>
        } />
        <Route path="ajustes/brevo" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><BrevoPage /></RoleGuard>
        } />
        <Route path="ajustes/auditoria" element={
          <RoleGuard allowedRoles={ADMIN_ROLES}><AuditoriaPage /></RoleGuard>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

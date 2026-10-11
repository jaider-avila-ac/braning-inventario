import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Bell, Menu } from "lucide-react";

const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  // Clientes
  "/clientes": "Clientes",
  "/clientes/nuevo": "Clientes / Nuevo",
  "/clientes/editar": "Clientes / Editar",
  "/clientes/facturas": "Clientes / Facturas",
  // Cotizaciones
  "/cotizaciones": "Cotizaciones",
  "/cotizaciones/nueva": "Cotizaciones / Nueva",
  "/cotizaciones/editar": "Cotizaciones / Editar",
  "/cotizaciones/ver": "Cotizaciones / Ver",
  "/cotizaciones/nueva-libre": "Cotizaciones / Nueva",
  "/cotizaciones/editar-libre": "Cotizaciones / Editar",
  // Facturas
  "/facturas": "Facturas",
  "/facturas/nueva": "Facturas / Nueva",
  "/facturas/editar": "Facturas / Editar",
  "/facturas/ver": "Facturas / Ver",
  "/facturas/nueva-libre": "Facturas / Nueva",
  "/facturas/editar-libre": "Facturas / Editar",
  // Proveedores
  "/proveedores": "Proveedores",
  "/proveedores/nuevo": "Proveedores / Nuevo",
  "/proveedores/editar": "Proveedores / Editar",
  // Catálogo
  "/catalogo": "Catálogo",
  "/catalogo/nuevo": "Catálogo / Nuevo",
  "/catalogo/editar": "Catálogo / Editar",
  // Finanzas
  "/finanzas": "Finanzas",
  "/finanzas/ingresos": "Finanzas / Ingresos",
  "/finanzas/egresos": "Finanzas / Egresos",
  "/finanzas/pendientes": "Saldos Pendientes",
  "/finanzas/cobro-rapido": "Finanzas / Cobro Rápido",
  // Compras e Inventario
  "/compras": "Compras",
  "/inventario/movimientos": "Inventario / Movimientos",
  // Venta rápida
  "/venta-rapida": "Venta Rápida",
  // Reportes
  "/reportes": "Reportes",
  // Empresa
  "/empresa": "Empresa",
  "/empresas/nueva": "Empresas / Nueva",
  // Ajustes
  "/ajustes/usuarios": "Ajustes / Usuarios",
  "/ajustes/usuario-form": "Ajustes / Nuevo Usuario",
  "/ajustes/usuario-form/:id": "Ajustes / Editar Usuario",
  "/ajustes/empresas": "Ajustes / Empresas",
  "/ajustes/brevo": "Ajustes / Brevo",
  "/ajustes/auditoria": "Ajustes / Auditoría",
};

function getTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];

  const lastSegment = pathname.substring(pathname.lastIndexOf("/") + 1);
  const isId = /^\d+$/.test(lastSegment);
  const parent = pathname.substring(0, pathname.lastIndexOf("/"));

  if (isId) {
    // Check for explicit /:id variant first
    const withIdKey = `${parent}/:id`;
    if (ROUTE_TITLES[withIdKey]) return ROUTE_TITLES[withIdKey];
    // Fall back to parent key
    if (parent && ROUTE_TITLES[parent]) return ROUTE_TITLES[parent];
  } else if (parent && ROUTE_TITLES[parent]) {
    return ROUTE_TITLES[parent];
  }

  // Fallback: match by two-segment prefix
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const twoSegment = `/${segments[0]}/${segments[1]}`;
    if (ROUTE_TITLES[twoSegment]) return ROUTE_TITLES[twoSegment];
  }

  return "SYS Comercial";
}

const rolColors = {
  SUPER_ADMIN: "bg-red-500",
  EMPRESA_ADMIN: "bg-blue-500",
  OPERATIVO: "bg-gray-500",
};

export default function TopBar({ onMenuClick }) {
  const { perfil } = useAuth();
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nombre = perfil
    ? `${perfil.nombres ?? ""} ${perfil.apellidos ?? ""}`.trim() || perfil.email || "Usuario"
    : "Usuario";
  const inicial = nombre.charAt(0).toUpperCase();
  const rol = perfil?.rol || "USUARIO";
  const avatarColor = rolColors[rol] || "bg-gray-500";

  return (
    <header className="h-16 shrink-0 sticky top-0 z-30 flex items-center px-4 bg-white border-b border-gray-200 shadow-sm">
      <button 
        onClick={onMenuClick} 
        className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors mr-2"
      >
        <Menu size={20} />
      </button>

      <span className="text-lg font-bold text-gray-800 ml-2 lg:ml-0">
        {getTitle(pathname)}
      </span>

      <div className="ml-auto flex items-center gap-4">
        <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
            {inicial}
          </div>
          {!isMobile && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-gray-800">{nombre}</div>
              <div className="text-xs text-gray-400">{rol.replace("_", " ")}</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
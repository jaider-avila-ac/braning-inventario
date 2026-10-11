import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  Wallet,
  Building2,
  Settings,
  LogOut,
  Truck,
  BarChart3,
} from "lucide-react";

const ALL = ["SUPER_ADMIN", "EMPRESA_ADMIN", "OPERATIVO"];
const ADMIN = ["SUPER_ADMIN", "EMPRESA_ADMIN"];

const NAV_ITEMS = [
  { to: "/dashboard",         Icon: LayoutDashboard, label: "Dashboard",    section: "Principal", roles: ALL   },
  { to: "/clientes",          Icon: Users,           label: "Clientes",     section: "Ventas",    roles: ALL   },
  { to: "/proveedores",       Icon: Truck,           label: "Proveedores",  section: "Compras",   roles: ALL   },
  { to: "/cotizaciones",      Icon: FileText,        label: "Cotizaciones", section: "Ventas",    roles: ALL   },
  { to: "/facturas",          Icon: Receipt,         label: "Facturas",     section: "Ventas",    roles: ALL   },
  { to: "/finanzas",          Icon: Wallet,          label: "Finanzas",     section: "Ventas",    roles: ADMIN },
  { to: "/reportes",          Icon: BarChart3,       label: "Reportes",     section: "Ventas",    roles: ADMIN },
  { to: "/catalogo",          Icon: Package,         label: "Catálogo",     section: "Inventario",roles: ALL   },
  { to: "/empresa",           Icon: Building2,       label: "Empresa",      section: "Inventario",roles: ADMIN },
  { to: "/ajustes/usuarios",  Icon: Settings,        label: "Ajustes",      section: "Admin",     roles: ADMIN },
];

export default function Sidebar({ open, isMobile, onToggle, onClose }) {
  const { logout, perfil } = useAuth();
  const rol = perfil?.rol || "OPERATIVO";

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(rol));

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const sidebarClasses = `
    sidebar
    bg-slate-800 text-white flex flex-col shadow-xl
    ${open ? "" : "sidebar--sm"}
    ${isMobile && open ? "mobile-open" : ""}
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Logo / Brand */}
      <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-slate-700">
        {open && (
          <span className="font-bold text-blue-400 text-base tracking-wide">SYS Comercial</span>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ${!open && "mx-auto"}`}
        >
          <i className={`bi bi-${open ? "layout-sidebar-inset" : "layout-sidebar"}`} style={{ fontSize: "1.125rem" }}></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-track]:bg-transparent [scrollbar-width:thin] [scrollbar-color:var(--color-slate-600)_transparent]">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section}>
            {open && (
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mt-2 mb-2">
                {section}
              </div>
            )}
            {items.map(({ to, Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap mb-1
                   ${isActive
                     ? "bg-blue-600 text-white"
                     : "text-slate-300 hover:text-white hover:bg-slate-700"}
                   ${!open && "justify-center px-2"}`
                }
              >
                <Icon size={18} className="shrink-0" />
                {open && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer - Logout */}
      <div className="border-t border-slate-700 p-2">
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 w-full transition-colors ${!open && "justify-center"}`}
        >
          <LogOut size={18} className="shrink-0" />
          {open && <span>Salir</span>}
        </button>
      </div>
    </aside>
  );
}

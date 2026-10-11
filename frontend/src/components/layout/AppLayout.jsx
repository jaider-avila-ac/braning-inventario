import { useState, useCallback, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useInactivity } from "../../hooks/useInactivity";
import { useSessionPing } from "../../hooks/useSessionPing";
import { useLogoCheck } from "../../hooks/useLogoCheck";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout() {
  const { token, logout } = useAuth();
  const [open, setOpen] = useState(window.innerWidth >= 1024);
  const [mobileOpen, setMobileOpen] = useState(false);

  useInactivity(useCallback(() => logout(), [logout]));
  useSessionPing();
  useLogoCheck();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(true);
        setMobileOpen(false);
      } else {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!token) return <Navigate to="/login" replace />;

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleCloseSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  };

  const isDesktop = window.innerWidth >= 1024;
  const isSidebarOpen = isDesktop ? open : mobileOpen;

  return (
    <div className="app-shell">
      <Sidebar 
        open={isSidebarOpen}
        isMobile={!isDesktop}
        onToggle={handleMenuClick}
        onClose={handleCloseSidebar}
      />
      
      {!isDesktop && mobileOpen && (
        <div className="sidebar-overlay open" onClick={handleCloseSidebar} />
      )}

      <div className={`app-main ${isDesktop && !open ? "app-main--sm" : ""}`}>
        <TopBar onMenuClick={handleMenuClick} />
        <main className="flex-1 p-4 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
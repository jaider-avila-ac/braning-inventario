// src/pages/Ajustes/useUsuarios.js
import { useState, useEffect, useCallback, useRef } from "react";
import { listarUsuarios, toggleUsuario, cambiarPassword, crearEmpresaConAdmin } from "../../services/usuarios.service";
import { showToast, showConfirm } from "../../utils/notifications";
import { useAuth } from "../../context/AuthContext";

export function useUsuarios() {
  const { perfil } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("");
  const [filtroEmpresaId, setFiltroEmpresaId] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [creandoEmpresa, setCreandoEmpresa] = useState(false);
  const [empresaForm, setEmpresaForm] = useState({
    nombre: "",
    nit: "",
    telefono: "",
    ciudad: "",
    direccion: "",
  });
  const [adminForm, setAdminForm] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [empresaError, setEmpresaError] = useState("");
  const [empresaSuccess, setEmpresaSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isSA = perfil?.rol === "SUPER_ADMIN";
  const debounceTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const ROL_LABELS = {
    SUPER_ADMIN: { text: "Super Admin", color: "bg-red-100 text-red-700 border-red-200" },
    EMPRESA_ADMIN: { text: "Empresa Admin", color: "bg-blue-100 text-blue-700 border-blue-200" },
    OPERATIVO: { text: "Operativo", color: "bg-gray-100 text-gray-700 border-gray-200" },
  };

  const loadUsuarios = useCallback(async (page = 1) => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    try {
      const data = await listarUsuarios({
        search,
        rol: filtroRol,
        activo: filtroActivo,
        empresa_id: isSA ? filtroEmpresaId : "",
        page,
        perPage: pagination.perPage
      });
      
      if (isMountedRef.current) {
        setUsuarios(data.data || []);
        setPagination({
          currentPage: data.current_page || 1,
          lastPage: data.last_page || 1,
          total: data.total || 0,
          perPage: data.per_page || 10
        });
        setError(null);
      }
    } catch (err) {
      console.error("Error loading usuarios:", err);
      if (isMountedRef.current) {
        setError(err.message || "Error al cargar usuarios");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [search, filtroRol, filtroActivo, filtroEmpresaId, isSA, pagination.perPage]);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      loadUsuarios(1);
    }, 300);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, filtroRol, filtroActivo, filtroEmpresaId, loadUsuarios]);

  // Limpiar al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const limpiarFiltros = () => {
    setSearch("");
    setFiltroRol("");
    setFiltroActivo("");
    setFiltroEmpresaId("");
  };

  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      loadUsuarios(newPage);
    }
  }, [pagination.lastPage, loadUsuarios]);

  const reload = useCallback(() => {
    loadUsuarios(pagination.currentPage);
  }, [loadUsuarios, pagination.currentPage]);

  const handleToggleUsuario = async (id, nombre, isActivo) => {
    const confirmado = await showConfirm(
      `${isActivo ? "¿Desactivar" : "¿Activar"} el usuario "${nombre}"?`,
      { title: "Cambiar estado", okLabel: "Sí, continuar" }
    );
    if (!confirmado) return;

    try {
      await toggleUsuario(id);
      showToast(`Usuario ${isActivo ? "desactivado" : "activado"} correctamente`, "success");
      loadUsuarios(pagination.currentPage);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const abrirModalPassword = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
    setModalPasswordOpen(true);
  };

  const handleGuardarPassword = async () => {
    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await cambiarPassword(selectedUser.id, newPassword, confirmPassword);
      setPasswordSuccess("Contraseña actualizada correctamente");
      setTimeout(() => {
        setModalPasswordOpen(false);
        setSelectedUser(null);
        setNewPassword("");
        setConfirmPassword("");
      }, 1500);
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const handleCrearEmpresaAdmin = async () => {
    setEmpresaError("");
    setEmpresaSuccess("");

    if (!empresaForm.nombre) {
      setEmpresaError("El nombre de la empresa es obligatorio.");
      return;
    }
    if (!adminForm.nombres) {
      setEmpresaError("El nombre del administrador es obligatorio.");
      return;
    }
    if (!adminForm.email) {
      setEmpresaError("El email del administrador es obligatorio.");
      return;
    }
    if (adminForm.password.length < 8) {
      setEmpresaError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (adminForm.password !== adminForm.password_confirmation) {
      setEmpresaError("Las contraseñas no coinciden.");
      return;
    }

    setCreandoEmpresa(true);
    try {
      const result = await crearEmpresaConAdmin({
        empresa: {
          nombre: empresaForm.nombre,
          nit: empresaForm.nit || null,
          telefono: empresaForm.telefono || null,
          ciudad: empresaForm.ciudad || null,
          direccion: empresaForm.direccion || null,
        },
        admin: {
          nombres: adminForm.nombres,
          apellidos: adminForm.apellidos || null,
          email: adminForm.email,
          password: adminForm.password,
          password_confirmation: adminForm.password_confirmation,
        },
      });
      setEmpresaSuccess(`Empresa "${result.empresa?.nombre}" creada. Admin: ${adminForm.email}`);
      setTimeout(() => {
        setModalEmpresaOpen(false);
        setEmpresaForm({
          nombre: "", nit: "", telefono: "", ciudad: "", direccion: "",
        });
        setAdminForm({
          nombres: "", apellidos: "", email: "", password: "", password_confirmation: "",
        });
        loadUsuarios(1);
      }, 2000);
    } catch (err) {
      setEmpresaError(err.message);
    } finally {
      setCreandoEmpresa(false);
    }
  };

  return {
    loading,
    error,
    usuarios,
    pagination,
    search,
    setSearch,
    filtroRol,
    setFiltroRol,
    filtroActivo,
    setFiltroActivo,
    filtroEmpresaId,
    setFiltroEmpresaId,
    isSA,
    ROL_LABELS,
    limpiarFiltros,
    changePage,
    reload,
    handleToggleUsuario,
    abrirModalPassword,
    modalPasswordOpen,
    setModalPasswordOpen,
    selectedUser,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    passwordSuccess,
    handleGuardarPassword,
    modalEmpresaOpen,
    setModalEmpresaOpen,
    empresaForm,
    setEmpresaForm,
    adminForm,
    setAdminForm,
    empresaError,
    empresaSuccess,
    creandoEmpresa,
    showPassword,
    setShowPassword,
    handleCrearEmpresaAdmin,
  };
}
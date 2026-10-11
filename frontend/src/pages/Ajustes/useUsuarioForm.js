// src/pages/Ajustes/useUsuarioForm.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerUsuario, crearUsuario, actualizarUsuario, cambiarPassword } from "../../services/usuarios.service";
import { showToast } from "../../utils/notifications";
import { useAuth } from "../../context/AuthContext";

export function useUsuarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { perfil } = useAuth();
  const isEditing = !!id;
  const isSA = perfil?.rol === "SUPER_ADMIN";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cambiarPassActivo, setCambiarPassActivo] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    password_confirmation: "",
    rol: "OPERATIVO",
    empresa_id: "",
    is_activo: "1",
  });

  const loadUsuario = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await obtenerUsuario(id);
      setFormData({
        nombres: data.nombres || "",
        apellidos: data.apellidos || "",
        email: data.email || "",
        password: "",
        password_confirmation: "",
        rol: data.rol || "OPERATIVO",
        empresa_id: data.empresa_id || "",
        is_activo: data.is_activo ? "1" : "0",
      });
    } catch (error) {
      console.error("Error loading usuario:", error);
      showToast(error.message || "Error al cargar el usuario", "error");
      navigate("/ajustes/usuarios");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEditing) {
      loadUsuario();
    }
  }, [isEditing, loadUsuario]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!formData.nombres.trim()) {
      showToast("El nombre es obligatorio", "error");
      return;
    }
    if (!formData.email.trim()) {
      showToast("El email es obligatorio", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim() || null,
        email: formData.email.trim(),
        rol: formData.rol,
        is_activo: formData.is_activo === "1",
      };

      if (isSA && formData.empresa_id) {
        payload.empresa_id = parseInt(formData.empresa_id, 10);
      }

      if (isEditing) {
        await actualizarUsuario(id, payload);
        if (cambiarPassActivo && formData.password) {
          await cambiarPassword(id, formData.password, formData.password_confirmation);
        }
        showToast("Usuario actualizado correctamente", "success");
      } else {
        if (!formData.password || formData.password.length < 8) {
          showToast("La contraseña debe tener al menos 8 caracteres", "error");
          setSaving(false);
          return;
        }
        if (formData.password !== formData.password_confirmation) {
          showToast("Las contraseñas no coinciden", "error");
          setSaving(false);
          return;
        }
        payload.password = formData.password;
        await crearUsuario(payload);
        showToast("Usuario creado correctamente", "success");
      }
      navigate("/ajustes/usuarios");
    } catch (error) {
      showToast(error.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    isEditing,
    isSA,
    cambiarPassActivo,
    setCambiarPassActivo,
    formData,
    handleChange,
    handleSubmit,
  };
}
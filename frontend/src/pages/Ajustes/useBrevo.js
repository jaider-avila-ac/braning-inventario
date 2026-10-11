// src/pages/Ajustes/useBrevo.js
import { useState, useEffect, useCallback } from "react";
import { getBrevoConfig, saveBrevoConfig, sendTestEmail } from "../../services/brevo.service";
import { showToast } from "../../utils/notifications";
import { useAuth } from "../../context/AuthContext";

export function useBrevo() {
  const { perfil } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [config, setConfig] = useState({
    is_activo: false,
    sender_name: "",
    sender_email: "",
    template_id: "",
    tiene_key: false,
  });
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [status, setStatus] = useState({ state: "", message: "" });
  const [showTestCard, setShowTestCard] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testMessage, setTestMessage] = useState({ text: "", type: "" });

  const isSA = perfil?.rol === "SUPER_ADMIN";
  const isEmpresaAdmin = perfil?.rol === "EMPRESA_ADMIN";

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setStatus({ state: "loading", message: "Cargando configuración..." });
    try {
      const data = await getBrevoConfig();
      if (!data) {
        setConfig({
          is_activo: false,
          sender_name: "",
          sender_email: "",
          template_id: "",
          tiene_key: false,
        });
        setStatus({ state: "", message: "Sin configuración. Completa el formulario y guarda." });
        return;
      }
      setConfig({
        is_activo: !!data.is_activo,
        sender_name: data.sender_name || "",
        sender_email: data.sender_email || "",
        template_id: data.template_id || "",
        tiene_key: data.tiene_key || false,
      });
      setStatus({ state: data.is_activo ? "ok" : "", message: "Configuración cargada correctamente." });
    } catch (error) {
      console.error("Error loading brevo config:", error);
      setStatus({ state: "error", message: error.message || "Error al cargar configuración" });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!config.sender_name.trim()) {
      showToast("El nombre del remitente es requerido", "error");
      return;
    }
    if (!config.sender_email.trim()) {
      showToast("El email del remitente es requerido", "error");
      return;
    }

    setSaving(true);
    setStatus({ state: "loading", message: "Guardando configuración..." });
    try {
      const payload = {
        is_activo: config.is_activo,
        api_key: apiKey.trim() || null,
        sender_name: config.sender_name.trim(),
        sender_email: config.sender_email.trim(),
        template_id: config.template_id ? parseInt(config.template_id, 10) : null,
      };
      await saveBrevoConfig(payload);
      showToast("Configuración guardada correctamente", "success");
      setApiKey("");
      await loadConfig();
    } catch (error) {
      console.error("Error saving brevo config:", error);
      showToast(error.message || "Error al guardar configuración", "error");
      setStatus({ state: "error", message: "Error al guardar" });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      setTestMessage({ text: "Ingresa un email de destino.", type: "error" });
      return;
    }
    setSending(true);
    setTestMessage({ text: "Enviando email de prueba...", type: "info" });
    try {
      await sendTestEmail(testEmail);
      setTestMessage({ text: "Email enviado correctamente.", type: "success" });
      setTestEmail("");
    } catch (error) {
      console.error("Error sending test email:", error);
      setTestMessage({ text: error.message || "Error al enviar email de prueba", type: "error" });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    loading,
    saving,
    sending,
    config,
    setConfig,
    apiKey,
    setApiKey,
    showApiKey,
    setShowApiKey,
    status,
    showTestCard,
    setShowTestCard,
    testEmail,
    setTestEmail,
    testMessage,
    setTestMessage,
    isSA,
    isEmpresaAdmin,
    loadConfig,
    handleSave,
    handleSendTest,
  };
}
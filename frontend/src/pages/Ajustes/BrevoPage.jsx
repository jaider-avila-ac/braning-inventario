// src/pages/Ajustes/BrevoPage.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, EyeOff, Send, Mail, Info } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useBrevo } from "./useBrevo";

export default function BrevoPage() {
  const navigate = useNavigate();
  const {
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
    handleSave,
    handleSendTest,
  } = useBrevo();

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-500">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-envelope-check text-blue-500"></i>
            Notificaciones por Email
          </h1>
          <p className="text-sm text-gray-500">
            Email automático al cliente cuando se registra un pago · Powered by Brevo
          </p>
        </div>
        <Button
          text="Volver"
          icon={ArrowLeft}
          variant="outline"
          onClick={() => navigate("/ajustes/usuarios")}
        />
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <i className="bi bi-send-fill text-2xl"></i>
            <div>
              <div className="font-bold text-lg">Brevo Transactional Email</div>
              <div className="text-sm text-blue-100">Cada empresa usa su propia cuenta Brevo</div>
            </div>
            <div className="ml-auto">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-semibold">Activo</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={config.is_activo}
                    onChange={(e) => setConfig({ ...config, is_activo: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Status */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
              status.state === "ok" ? "bg-green-500" : 
              status.state === "error" ? "bg-red-500" : 
              status.state === "loading" ? "bg-yellow-500 animate-pulse" : "bg-gray-400"
            }`}></span>
            <span className="text-sm text-gray-500">{status.message || "Cargando configuración..."}</span>
          </div>

          {/* API Key */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={config.tiene_key ? "API Key guardada - déjala vacía para no cambiarla" : "xkeysib-..."}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tu API Key de Brevo. Déjala en blanco para no cambiarla.
            </p>
          </div>

          {/* Sender Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre remitente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.sender_name}
                onChange={(e) => setConfig({ ...config, sender_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mi Empresa S.A."
              />
              <p className="text-xs text-gray-500 mt-1">Nombre que verá el cliente.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email remitente <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={config.sender_email}
                onChange={(e) => setConfig({ ...config, sender_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pagos@miempresa.com"
              />
              <p className="text-xs text-gray-500 mt-1">Debe estar verificado en Brevo.</p>
            </div>
          </div>

          {/* Template ID */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template ID <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              type="number"
              min="1"
              value={config.template_id}
              onChange={(e) => setConfig({ ...config, template_id: e.target.value })}
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="345"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si no lo llenas, el sistema enviará un HTML prediseñado.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              text="Guardar configuración"
              icon={Save}
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            />
            <Button
              text="Enviar prueba"
              icon={Mail}
              variant="outline"
              onClick={() => setShowTestCard(!showTestCard)}
            />
          </div>
        </div>
      </div>

      {/* Test Card */}
      {showTestCard && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mt-4">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail size={16} className="text-blue-500" />
              Enviar email de prueba
            </h3>
          </div>
          <div className="p-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de destino
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tu@ejemplo.com"
                />
              </div>
              <Button
                text={sending ? "Enviando..." : "Enviar"}
                icon={Send}
                variant="primary"
                onClick={handleSendTest}
                disabled={sending}
              />
            </div>
            {testMessage.text && (
              <div className={`mt-3 text-sm ${
                testMessage.type === "error" ? "text-red-600" : 
                testMessage.type === "success" ? "text-green-600" : "text-gray-500"
              }`}>
                {testMessage.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Card */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mt-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-1">¿Cómo obtener tu API Key?</h4>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Crea cuenta gratis en <a href="https://app.brevo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">app.brevo.com</a></li>
              <li>Ve a <strong>Settings → API Keys</strong> y crea una nueva clave</li>
              <li>Verifica tu remitente en <strong>Senders</strong></li>
              <li>Pega la API Key y el email verificado aquí y guarda</li>
            </ol>
            <p className="text-xs text-blue-600 mt-2">
              <i className="bi bi-gift mr-1"></i>El plan gratuito incluye 300 emails/día.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
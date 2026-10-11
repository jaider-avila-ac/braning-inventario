import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validarCorreo, validarPassword, setUser } from "../../services/auth.service";
import { Building2, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("correo");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCorreo(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await validarCorreo(correo);
      setSessionToken(resp.sessionToken);
      setStep("password");
      setPassword("");
    } catch (err) {
      setError(err?.message ?? "Correo no encontrado.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePassword(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await validarPassword(sessionToken, password);
      setUser({ ...resp.usuario, access_token: resp.token });
      login(resp.token, resp.usuario);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message ?? "Contraseña incorrecta.");
    } finally {
      setLoading(false);
    }
  }

  const handleBack = () => {
    setStep("correo");
    setError("");
    setCorreo("");
    setPassword("");
    setSessionToken(null);
  };

  const togglePassword = () => {
    setShowPass(!showPass);
  };

  const isCorreo = step === "correo";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white text-center py-6">
          <Building2 className="w-8 h-8 mx-auto mb-2" />
          <h4 className="font-bold text-xl">SYS Comercial</h4>
          <small className="opacity-75 text-sm">Multiempresa · Ingresa a tu cuenta</small>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={isCorreo ? handleCorreo : handlePassword}>
            
            {/* PASO 1: SOLO EMAIL */}
            {isCorreo && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline w-4 h-4 mr-1" /> Correo electrónico
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="correo@empresa.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
                
                {error && (
                  <div className="text-red-600 text-sm mb-3">{error}</div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verificando...
                    </>
                  ) : "Continuar"}
                </button>
              </div>
            )}

            {/* PASO 2: SOLO CONTRASEÑA */}
            {!isCorreo && (
              <div>
                <div className="mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <Mail className="inline w-4 h-4 mr-1" /> Ingresando como: <strong>{correo}</strong>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Lock className="inline w-4 h-4 mr-1" /> Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={togglePassword}
                    >
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="text-red-600 text-sm mb-3">{error}</div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : "Ingresar"}
                </button>
                
                <button
                  type="button"
                  className="w-full text-blue-600 hover:text-blue-700 text-sm mt-3 flex items-center justify-center gap-1"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al correo
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
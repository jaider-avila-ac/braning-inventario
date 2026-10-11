// src/pages/Empresa/EmpresaPage.jsx
import { useState, useRef } from "react";
import { useEmpresa } from "./useEmpresa";

export default function EmpresaPage() {
  const { 
    loading, 
    loadingLogo, 
    guardando, 
    subiendoLogo, 
    empresa, 
    logoUrl,
    actualizar, 
    actualizarLogo, 
    removerLogo 
  } = useEmpresa();
  
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    matricula: "",
    email: "",
    pagina_web: "",
    telefono: "",
    direccion: "",
  });
  const fileInputRef = useRef(null);

  const iniciarEdicion = () => {
    if (empresa) {
      setFormData({
        nombre: empresa.nombre || "",
        nit: empresa.nit || "",
        matricula: empresa.matricula || "",
        email: empresa.email || "",
        pagina_web: empresa.pagina_web || "",
        telefono: empresa.telefono || "",
        direccion: empresa.direccion || "",
      });
      setEditando(true);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const exito = await actualizar(formData);
    if (exito) {
      setEditando(false);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await actualizarLogo(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEliminarLogo = async () => {
    await removerLogo();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-500">Cargando datos de la empresa...</span>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          <i className="bi bi-building text-4xl block mb-2"></i>
          <p>No se pudieron cargar los datos de la empresa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i className="bi bi-building text-blue-500"></i>
            Mi Empresa
          </h1>
          <p className="text-sm text-gray-500">Información de tu empresa</p>
        </div>
        {!editando && (
          <button
            onClick={iniciarEdicion}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <i className="bi bi-pencil"></i>
            Editar
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {loadingLogo ? (
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo empresa"
                className="w-32 h-32 object-contain rounded-lg border border-gray-200 bg-white p-1"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                  <i className="bi bi-building text-4xl text-gray-400"></i>
                </div>
              )}
              <label
                htmlFor="logo-upload"
                className="absolute -bottom-2 -right-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md transition-colors"
                title="Subir logo"
              >
                <i className="bi bi-camera text-sm"></i>
              </label>
              <input
                ref={fileInputRef}
                id="logo-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleLogoChange}
                disabled={subiendoLogo}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Logo de la empresa</h3>
              <p className="text-sm text-gray-500 mt-1">
                Formatos permitidos: JPG, PNG, WEBP. Máximo 2MB.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={subiendoLogo}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <i className="bi bi-cloud-upload"></i>
                  {subiendoLogo ? "Subiendo..." : "Cambiar logo"}
                </button>
                {empresa.logo_path && (
                  <button
                    onClick={handleEliminarLogo}
                    disabled={subiendoLogo}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <i className="bi bi-trash"></i>
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la empresa *
              </label>
              {editando ? (
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-800 py-2">{empresa.nombre || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIT *
              </label>
              {editando ? (
                <input
                  type="text"
                  name="nit"
                  value={formData.nit}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-800 py-2">{empresa.nit || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matrícula mercantil <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              {editando ? (
                <input
                  type="text"
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleChange}
                  placeholder="Ej: 12345-6"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-800 py-2">{empresa.matricula || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              {editando ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-800 py-2">{empresa.email || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              {editando ? (
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-800 py-2">{empresa.telefono || "—"}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Página web <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              {editando ? (
                <input
                  type="text"
                  name="pagina_web"
                  value={formData.pagina_web}
                  onChange={handleChange}
                  placeholder="www.empresa.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-800 py-2">{empresa.pagina_web || "—"}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            {editando ? (
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800 py-2">{empresa.direccion || "—"}</p>
            )}
          </div>

          {editando && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {guardando && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
// src/pages/Empresa/EmpresaFormPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { crearEmpresaConAdmin } from "../../services/usuarios.service";
import { showToast } from "../../utils/notifications";

export default function EmpresaFormPage() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    const [empresaForm, setEmpresaForm] = useState({
        nombre: "",
        nit: "",
        matricula: "",
        email: "",
        pagina_web: "",
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

    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleEmpresaChange = (e) => {
        setEmpresaForm({ ...empresaForm, [e.target.name]: e.target.value });
    };

    const handleAdminChange = (e) => {
        setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!empresaForm.nombre) {
        setError("El nombre de la empresa es obligatorio.");
        return;
    }
    if (!adminForm.nombres) {
        setError("El nombre del administrador es obligatorio.");
        return;
    }
    if (!adminForm.email) {
        setError("El email del administrador es obligatorio.");
        return;
    }
    if (adminForm.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
    }
    if (adminForm.password !== adminForm.password_confirmation) {
        setError("Las contraseñas no coinciden.");
        return;
    }

    setSaving(true);
    try {
        await crearEmpresaConAdmin({
            empresa: {
                nombre: empresaForm.nombre,
                nit: empresaForm.nit || null,
                matricula: empresaForm.matricula || null,
                email: empresaForm.email || null,
                pagina_web: empresaForm.pagina_web || null,
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
        showToast("Empresa y administrador creados correctamente", "success");
        navigate("/empresas");
    } catch (err) {
        setError(err.message);
    } finally {
        setSaving(false);
    }
};

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Building2 className="text-blue-500" />
                        Nueva Empresa
                    </h1>
                    <p className="text-sm text-gray-500">
                        Crea una nueva empresa y su usuario administrador en un solo paso
                    </p>
                </div>
                <Button
                    text="Volver"
                    icon={ArrowLeft}
                    variant="outline"
                    onClick={() => navigate("/empresas")}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Datos de la empresa */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                            <Building2 size={18} className="text-blue-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Datos de la empresa</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Input
                                    id="nombre"
                                    name="nombre"
                                    label="Nombre / Razón social *"
                                    value={empresaForm.nombre}
                                    onChange={handleEmpresaChange}
                                    required
                                    placeholder="Ej: Distribuciones Caribe S.A.S."
                                />
                            </div>
                            <Input
                                id="nit"
                                name="nit"
                                label="NIT / Identificación"
                                value={empresaForm.nit}
                                onChange={handleEmpresaChange}
                                placeholder="900.123.456-7"
                            />
                            <Input
                                id="matricula"
                                name="matricula"
                                label="Matrícula mercantil"
                                value={empresaForm.matricula}
                                onChange={handleEmpresaChange}
                                placeholder="Ej: 12345-6"
                            />
                            <Input
                                id="email"
                                name="email"
                                label="Correo electrónico"
                                type="email"
                                value={empresaForm.email}
                                onChange={handleEmpresaChange}
                                placeholder="contacto@empresa.com"
                            />
                            <Input
                                id="pagina_web"
                                name="pagina_web"
                                label="Página web"
                                value={empresaForm.pagina_web}
                                onChange={handleEmpresaChange}
                                placeholder="www.empresa.com"
                            />
                            <Input
                                id="telefono"
                                name="telefono"
                                label="Teléfono"
                                value={empresaForm.telefono}
                                onChange={handleEmpresaChange}
                                placeholder="+57 300 0000000"
                            />
                            <Input
                                id="ciudad"
                                name="ciudad"
                                label="Ciudad"
                                value={empresaForm.ciudad}
                                onChange={handleEmpresaChange}
                                placeholder="Barranquilla"
                            />
                            <div className="md:col-span-2">
                                <Input
                                    id="direccion"
                                    name="direccion"
                                    label="Dirección"
                                    value={empresaForm.direccion}
                                    onChange={handleEmpresaChange}
                                    placeholder="Cra. 40 #72-15, Local 3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Datos del administrador */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                            <UserPlus size={18} className="text-green-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Administrador de la empresa</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                id="nombres"
                                name="nombres"
                                label="Nombres *"
                                value={adminForm.nombres}
                                onChange={handleAdminChange}
                                required
                            />
                            <Input
                                id="apellidos"
                                name="apellidos"
                                label="Apellidos"
                                value={adminForm.apellidos}
                                onChange={handleAdminChange}
                            />
                            <div className="md:col-span-2">
                                <Input
                                    id="email"
                                    name="email"
                                    label="Email *"
                                    type="email"
                                    value={adminForm.email}
                                    onChange={handleAdminChange}
                                    required
                                    placeholder="admin@empresa.com"
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    label="Contraseña *"
                                    type={showPassword ? "text" : "password"}
                                    value={adminForm.password}
                                    onChange={handleAdminChange}
                                    required
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                                >
                                    <i className={`bi bi-${showPassword ? "eye-slash" : "eye"}`}></i>
                                </button>
                            </div>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                label="Confirmar contraseña *"
                                type="password"
                                value={adminForm.password_confirmation}
                                onChange={handleAdminChange}
                                required
                                placeholder="Repite la contraseña"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="submit"
                            text={saving ? "Creando..." : "Crear empresa y administrador"}
                            icon={Save}
                            variant="primary"
                            disabled={saving}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
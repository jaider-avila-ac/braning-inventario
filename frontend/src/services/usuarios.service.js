// src/services/usuarios.service.js
import { apiFetch, csrfCookie } from "./api";

/**
 * Lista paginada de usuarios
 */
export async function listarUsuarios({ search = "", activo = "", rol = "", empresa_id = "", page = 1, perPage = 10 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (activo !== "") params.append("activo", activo);
    if (rol) params.append("rol", rol);
    if (empresa_id) params.append("empresa_id", empresa_id);
    params.append("page", page);
    params.append("per_page", perPage);

    const res = await apiFetch(`/usuarios?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "No se pudo listar usuarios");
    return data;
}

/**
 * Ver un usuario
 */
export async function obtenerUsuario(id) {
    const res = await apiFetch(`/usuarios/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "No se pudo cargar el usuario");
    return data.usuario;
}

/**
 * Crear usuario
 */
export async function crearUsuario(payload) {
    await csrfCookie();
    const res = await apiFetch("/usuarios", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "No se pudo crear el usuario");
    return data.usuario;
}

/**
 * Editar usuario
 */
export async function actualizarUsuario(id, payload) {
    await csrfCookie();
    const res = await apiFetch(`/usuarios/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "No se pudo actualizar el usuario");
    return data.usuario;
}

/**
 * Habilitar / deshabilitar usuario
 */
export async function toggleUsuario(id) {
    await csrfCookie();
    const res = await apiFetch(`/usuarios/${id}/toggle`, { method: "PATCH" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "No se pudo cambiar el estado");
    return data.usuario;
}

/**
 * Cambiar contraseña
 */
export async function cambiarPassword(id, password, password_confirmation) {
    await csrfCookie();
    const res = await apiFetch(`/usuarios/${id}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password, password_confirmation }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "No se pudo cambiar la contraseña");
    return data;
}

/**
 * Obtener historial de auditoría de un usuario
 */
export async function getAuditoria(id, { tipo = "sobre", page = 1 } = {}) {
    const res = await apiFetch(`/usuarios/${id}/auditoria?tipo=${tipo}&page=${page}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "No se pudo cargar la auditoría");
    return data;
}

/**
 * Obtener configuración de Brevo
 */
export async function getBrevoConfig() {
    const res = await apiFetch("/brevo/config");
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al cargar configuración de Brevo");
    return data.config;
}

/**
 * Guardar configuración de Brevo
 */
export async function saveBrevoConfig(payload) {
    await csrfCookie();
    const res = await apiFetch("/brevo/config", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al guardar configuración");
    return data;
}

/**
 * Enviar email de prueba
 */
export async function sendTestEmail(email) {
    await csrfCookie();
    const res = await apiFetch("/brevo/test", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Error al enviar email de prueba");
    return data;
}
export async function activosAhora(minutos = 30) {
  const res = await apiFetch(`/usuarios/activos-ahora?minutos=${minutos}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al obtener usuarios activos");
  return data;
}
/**
 * Crear empresa con administrador (solo SUPER_ADMIN)
 */export async function crearEmpresaConAdmin({ empresa, admin }) {
    await csrfCookie();

    // Asegurar que el email de la empresa tenga valor (usar el del admin si no viene)
    const empresaEmail = empresa.email || admin.email;

    const resEmp = await apiFetch("/empresas", {
        method: "POST",
        body: JSON.stringify({
            nombre: empresa.nombre,
            nit: empresa.nit || null,
            email: empresaEmail,  // ✅ Enviar email de la empresa
            telefono: empresa.telefono || null,
            direccion: empresa.direccion || null,
            ciudad: empresa.ciudad || null,
        }),
    });
    
    const dataEmp = await resEmp.json();
    if (!resEmp.ok) throw new Error(dataEmp?.message || "No se pudo crear la empresa.");

    const empresaCreada = dataEmp.empresa ?? dataEmp;
    const empresaId = empresaCreada.id;

    if (!empresaId) {
        throw new Error("La empresa fue creada pero no se recibió su ID.");
    }

    const resUser = await apiFetch("/usuarios", {
        method: "POST",
        body: JSON.stringify({
            ...admin,
            rol: "EMPRESA_ADMIN",
            empresa_id: empresaId,
            is_activo: true,
        }),
    });
    
    const dataUser = await resUser.json();
    if (!resUser.ok) {
        throw new Error(
            `Empresa creada (ID: ${empresaId}) pero el admin falló: ${dataUser?.message ?? "Error desconocido"}`
        );
    }

    return {
        empresa: empresaCreada,
        usuario: dataUser.usuario ?? dataUser,
    };
}
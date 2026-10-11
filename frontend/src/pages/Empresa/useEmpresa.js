import { useState, useCallback, useRef, useEffect } from "react";
import { obtenerEmpresa, actualizarEmpresa, subirLogo, eliminarLogo, obtenerLogoUrl, revocarLogoUrl } from "../../services/empresa.service";
import { showToast, showConfirm } from "../../utils/notifications";

export function useEmpresa() {
    const [loading, setLoading] = useState(false);
    const [loadingLogo, setLoadingLogo] = useState(false);
    const [empresa, setEmpresa] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);
    const [subiendoLogo, setSubiendoLogo] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // Ref para el blob activo — NO entra en deps, rompe el bucle
    const blobRef = useRef(null);

    const cargarEmpresa = useCallback(() => {
        Promise.resolve()
            .then(() => {
                setLoading(true);
                return obtenerEmpresa();
            })
            .then(data => setEmpresa(data))
            .catch(error => showToast(error.message || "Error al cargar datos de la empresa", "error"))
            .finally(() => setLoading(false));
    }, []);

    // logoPath viene como argumento → logoUrl NO está en deps → sin bucle
    const cargarLogo = useCallback((logoPath) => {
        if (!logoPath) {
            Promise.resolve().then(() => {
                if (blobRef.current) { revocarLogoUrl(blobRef.current); blobRef.current = null; }
                setLogoUrl(null);
                setLoadingLogo(false);
            });
            return;
        }

        Promise.resolve()
            .then(() => {
                setLoadingLogo(true);
                return obtenerLogoUrl();
            })
            .then(url => {
                if (blobRef.current) revocarLogoUrl(blobRef.current);
                blobRef.current = url;
                setLogoUrl(url);
            })
            .catch(err => {
                console.error("Error cargando logo:", err);
                setLogoUrl(null);
            })
            .finally(() => setLoadingLogo(false));
    }, []); // Sin deps — referencia estable

    useEffect(() => {
        cargarEmpresa();
    }, [cargarEmpresa]);

    // Dispara cuando empresa cambia (upload/delete/initial load)
    // cargarLogo es estable → solo empresa controla cuándo corre
    useEffect(() => {
        if (empresa !== null) {
            cargarLogo(empresa.logo_path ?? null);
        }
    }, [empresa, cargarLogo]);

    // Liberar blob al desmontar
    useEffect(() => {
        return () => { if (blobRef.current) revocarLogoUrl(blobRef.current); };
    }, []);

    const actualizar = useCallback(async (payload) => {
        if (!empresa?.id) return false;
        setGuardando(true);
        try {
            const data = await actualizarEmpresa(empresa.id, payload);
            setEmpresa(data);
            showToast("Datos actualizados correctamente", "success");
            return true;
        } catch (error) {
            showToast(error.message || "Error al actualizar datos", "error");
            return false;
        } finally {
            setGuardando(false);
        }
    }, [empresa]);

    // Subir logo
const actualizarLogo = useCallback(async (file) => {
  if (!empresa?.id) return false;

  // Validar tipo de archivo
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!tiposPermitidos.includes(file.type)) {
    showToast("Formato no permitido. Use JPG, PNG o WEBP", "error");
    return false;
  }

  // Validar tamaño (máx 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showToast("La imagen no puede superar los 2MB", "error");
    return false;
  }

  setSubiendoLogo(true);
  try {
    const data = await subirLogo(empresa.id, file);
    
    // 👈 Limpiar logoUrl actual ANTES de actualizar empresa
    if (blobRef.current) {
      revocarLogoUrl(blobRef.current);
      blobRef.current = null;
    }
    setLogoUrl(null);
    
    setEmpresa(data);
    showToast("Logo actualizado correctamente", "success");
    return true;
  } catch (error) {
    console.error("Error subiendo logo:", error);
    showToast(error.message || "Error al subir el logo", "error");
    return false;
  } finally {
    setSubiendoLogo(false);
  }
}, [empresa]);

    const removerLogo = useCallback(async () => {
        if (!empresa?.id) return false;

        const confirmado = await showConfirm(
            "¿Estás seguro de que deseas eliminar el logo?",
            { title: "Eliminar logo", okLabel: "Sí, eliminar" }
        );
        if (!confirmado) return false;

        setSubiendoLogo(true);
        try {
            const data = await eliminarLogo(empresa.id);
            setEmpresa(data); // logo_path → null → cargarLogo(null) → setLogoUrl(null)
            showToast("Logo eliminado correctamente", "success");
            return true;
        } catch (error) {
            showToast(error.message || "Error al eliminar el logo", "error");
            return false;
        } finally {
            setSubiendoLogo(false);
        }
    }, [empresa]);

    return {
        loading,
        loadingLogo,
        guardando,
        subiendoLogo,
        empresa,
        logoUrl,
        cargarEmpresa,
        actualizar,
        actualizarLogo,
        removerLogo,
    };
}

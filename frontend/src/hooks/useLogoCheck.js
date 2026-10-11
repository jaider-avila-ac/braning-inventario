import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

export function useLogoCheck() {
  const { perfil } = useAuth();
  const navigate   = useNavigate();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (perfil?.rol !== "EMPRESA_ADMIN") return;
    if (checkedRef.current) return;

    checkedRef.current = true;

    apiFetch("/empresa/me")
      .then(res => res.json())
      .then(data => {
        if (data?.empresa?.logo_path) return;

        Swal.fire({
          title: "Logo pendiente",
          html: "Tu empresa aún no tiene logo.<br>Aparece en facturas y cotizaciones.",
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          confirmButtonText: "Subir logo ahora",
          cancelButtonText: "Más tarde",
        }).then(result => {
          if (result.isConfirmed) navigate("/empresa");
        });
      })
      .catch(() => {});
  }, [perfil, navigate]);
}

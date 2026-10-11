import { apiFetch, csrfCookie } from "./api";

export async function listInventario({ page = 1, search = "", tipo = "", solo_controla = "1", empresa_id = null, perPage = 10 } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("per_page", String(perPage));
  if (search) params.set("search", search);
  if (tipo) params.set("tipo", tipo);
  if (solo_controla !== null && solo_controla !== undefined) params.set("solo_controla", String(solo_controla));
  if (empresa_id) params.set("empresa_id", String(empresa_id));

  const res = await apiFetch(`/inventario?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al listar inventario");
  
  return {
    data: data.data || [],
    current_page: data.current_page || 1,
    last_page: data.last_page || 1,
    per_page: data.per_page || perPage,
    total: data.total || 0,
  };
}

export async function ajustarInventario(payload) {
  await csrfCookie();
  const res = await apiFetch(`/inventario/ajustar`, { 
    method: "POST", 
    body: JSON.stringify(payload) 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al ajustar inventario");
  return data;
}

export async function movimientosInventario({ page = 1, item_id = "", desde = "", hasta = "", empresa_id = null, perPage = 10 } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("per_page", String(perPage));
  if (item_id) params.set("item_id", String(item_id));
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  if (empresa_id) params.set("empresa_id", String(empresa_id));

  const res = await apiFetch(`/inventario/movimientos?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error al cargar movimientos");
  
  return {
    data: data.data || [],
    current_page: data.current_page || 1,
    last_page: data.last_page || 1,
    per_page: data.per_page || perPage,
    total: data.total || 0,
  };
}
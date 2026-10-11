export const formatMoney = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

export const formatDate = (iso) => {
  if (!iso) return "—";
  return iso.substring(0, 10);
};
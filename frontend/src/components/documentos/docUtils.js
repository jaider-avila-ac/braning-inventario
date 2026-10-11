export const fmtMoney = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(parseFloat(v) || 0);

export const fmtDate = (s) => {
  if (!s) return "—";
  const [y, m, d] = s.substring(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

import { fmtMoney, fmtDate } from "./docUtils";

export default function Formato4({ data, emp, logoUrl, accentColor, tipo }) {
  const cli = data.cliente ?? {};
  const usr = data.usuario ?? {};
  const lineas = data.lineas ?? [];
  const hasDesc = lineas.some(l => parseFloat(l.descuento) > 0);
  const saldo = parseFloat(data.saldo) || 0;
  const totalPagado = parseFloat(data.total_pagado) || 0;
  const ac = accentColor || "#1b3a5c";

  return (
    <div style={{ background: "white", fontFamily: "'Segoe UI', 'Barlow', sans-serif", overflow: "hidden" }}>
      {/* Banda superior */}
      <div style={{ background: ac, padding: "28px 40px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -20, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", top: 10, right: 80, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {logoUrl && <img src={logoUrl} alt="logo" style={{ height: 48, filter: "brightness(0) invert(1)", opacity: 0.92 }} />}
        </div>
        <div style={{ textAlign: "right", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: -0.5, lineHeight: 1 }}>{tipo} de Venta</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", fontWeight: 400, marginTop: 4, letterSpacing: 1 }}>{data.numero}</div>
          <span style={{ display: "inline-block", marginTop: 8, background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.25)" }}>
            {data.estado}
          </span>
        </div>
      </div>

      {/* Sub-banda con fechas */}
      <div style={{ background: ac, opacity: 0.85, padding: "0 40px 20px", display: "flex", gap: 32 }}>
        {[
          { lbl: "Fecha emisión", val: fmtDate(data.fecha) },
          data.fecha_vencimiento && { lbl: "Fecha vencimiento", val: fmtDate(data.fecha_vencimiento) },
          { lbl: "Empresa", val: [emp.nombre, emp.nit && `NIT: ${emp.nit}`, emp.matricula && `Matr.: ${emp.matricula}`, emp.pagina_web].filter(Boolean).join(" — ") },
        ].filter(Boolean).map(({ lbl, val }) => (
          <div key={lbl} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{lbl}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Cuerpo */}
      <div style={{ padding: "36px 40px" }}>
        {/* Cards info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          {[
            {
              title: "Datos del cliente",
              rows: [
                { lbl: "Nombre", val: cli.nombre_razon_social },
                { lbl: "Documento", val: `${cli.tipo_documento}: ${cli.num_documento}` },
                { lbl: "Dirección", val: cli.direccion },
              ],
            },
            {
              title: "Datos de la venta",
              rows: [
                { lbl: "Vendedor", val: `${usr.nombres} ${usr.apellidos}` },
                { lbl: "Emisión", val: fmtDate(data.fecha) },
                data.fecha_vencimiento && { lbl: "Vencimiento", val: fmtDate(data.fecha_vencimiento) },
              ].filter(Boolean),
            },
          ].map(({ title, rows }) => (
            <div key={title} style={{ border: "1px solid #e8ecf0", borderRadius: 8, padding: "16px 20px", background: "#fafbfc" }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: ac, fontWeight: 700, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #e8ecf0" }}>{title}</div>
              {rows.map(({ lbl, val }) => (
                <div key={lbl} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: "#999", minWidth: 100, fontWeight: 500 }}>{lbl}</span>
                  <span style={{ color: "#222", fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: ac, fontWeight: 700, marginBottom: 10 }}>Detalle de productos y servicios</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: ac }}>
                {["#", "Producto / Descripción", "Cant.", "Valor unitario", hasDesc && "Descuento", "Total línea"].filter(Boolean).map((h, i) => (
                  <th key={i} style={{ padding: "11px 14px", color: "white", textAlign: i > 1 ? "right" : "left", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineas.map((l, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f5f7f9" }}>
                  <td style={{ padding: "11px 14px", color: "#333", borderBottom: "1px solid #eceff2" }}>{i + 1}</td>
                  <td style={{ padding: "11px 14px", color: "#333", borderBottom: "1px solid #eceff2" }}>{l.descripcion_manual || l.item?.nombre}</td>
                  <td style={{ padding: "11px 14px", color: "#333", borderBottom: "1px solid #eceff2", textAlign: "right" }}>{l.cantidad}</td>
                  <td style={{ padding: "11px 14px", color: "#333", borderBottom: "1px solid #eceff2", textAlign: "right" }}>{fmtMoney(l.valor_unitario)}</td>
                  {hasDesc && <td style={{ padding: "11px 14px", color: "#333", borderBottom: "1px solid #eceff2", textAlign: "right" }}>{fmtMoney(l.descuento)}</td>}
                  <td style={{ padding: "11px 14px", color: "#111", borderBottom: "1px solid #eceff2", textAlign: "right", fontWeight: 700 }}>{fmtMoney(l.total_linea)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notas + Totales */}
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", marginBottom: 32 }}>
          <div style={{ flex: 1 }}>
            {data.notas && (
              <>
                <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: ac, fontWeight: 700, marginBottom: 8 }}>Observaciones</div>
                <div style={{ background: "#f5f7f9", borderLeft: "3px solid #d0d8e4", padding: "12px 14px", fontSize: 13, color: "#666", lineHeight: 1.6, fontStyle: "italic", borderRadius: "0 6px 6px 0" }}>{data.notas}</div>
              </>
            )}
          </div>
          <div style={{ width: 256, flexShrink: 0 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: ac, fontWeight: 700, marginBottom: 8 }}>Resumen de totales</div>
            <div style={{ border: "1px solid #e8ecf0", borderRadius: 8, overflow: "hidden" }}>
              {[
                { lbl: "Subtotal", val: fmtMoney(data.subtotal) },
                parseFloat(data.total_descuentos) > 0 && { lbl: "Descuentos", val: `-${fmtMoney(data.total_descuentos)}` },
                { lbl: "IVA", val: fmtMoney(data.total_iva) },
              ].filter(Boolean).map(({ lbl, val }) => (
                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", fontSize: 13, color: "#555", background: "white", borderBottom: "1px solid #f0f2f5" }}>
                  <span>{lbl}</span><span style={{ fontWeight: 600, color: "#333" }}>{val}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", fontSize: 14, fontWeight: 800, color: "#111", background: "#f5f7f9", borderTop: "2px solid #d0d8e4" }}>
                <span>TOTAL</span><span style={{ fontSize: 15 }}>{fmtMoney(data.total)}</span>
              </div>
              {data.estado !== "BORRADOR" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", fontSize: 13, color: "#555", background: "white", borderTop: "1px solid #f0f2f5" }}>
                    <span>Pagado</span><span style={{ fontWeight: 600 }}>{fmtMoney(totalPagado)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", fontSize: 13, color: "#555", background: "white", borderTop: "1px solid #f0f2f5" }}>
                    <span>Saldo pendiente</span><span style={{ fontWeight: 600 }}>{fmtMoney(saldo)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Firma */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 140, borderTop: "1px dashed #ccc", marginBottom: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>{usr.nombres} {usr.apellidos}</div>
          <div style={{ fontSize: 11, color: "#aaa" }}>Vendedor</div>
        </div>
      </div>

      {/* Footer con banda de color */}
      <div style={{ background: ac, padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        {[emp.nombre, `NIT: ${emp.nit}`, emp.matricula && `Matr.: ${emp.matricula}`, emp.direccion, `Tel: ${emp.telefono}`, emp.email, emp.pagina_web].filter(Boolean).map((s, i, arr) => (
          <span key={i} style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>
            {s}{i < arr.length - 1 && <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 6px" }}>·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

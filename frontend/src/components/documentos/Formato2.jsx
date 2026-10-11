import { fmtMoney, fmtDate } from "./docUtils";

export default function Formato2({ data, emp, logoUrl, accentColor, tipo }) {
  const cli = data.cliente ?? {};
  const usr = data.usuario ?? {};
  const lineas = data.lineas ?? [];
  const hasDesc = lineas.some(l => parseFloat(l.descuento) > 0);
  const saldo = parseFloat(data.saldo) || 0;
  const totalPagado = parseFloat(data.total_pagado) || 0;
  const ac = accentColor || "#7c3a2d";

  return (
    <div style={{ display: "flex", background: "white", minHeight: 960, fontFamily: "'Georgia', serif" }}>
      {/* Sidebar */}
      <div style={{ width: 200, flexShrink: 0, background: ac, display: "flex", flexDirection: "column", padding: "44px 24px 32px", position: "relative", overflow: "hidden" }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", bottom: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: 60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        {logoUrl && (
          <div style={{ marginBottom: 36 }}>
            <img src={logoUrl} alt="logo" style={{ width: 120, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
          </div>
        )}

        {[
          { lbl: "Número", val: data.numero, big: true },
          { lbl: "Estado", val: data.estado },
          { lbl: "Fecha emisión", val: fmtDate(data.fecha) },
          data.fecha_vencimiento && { lbl: "Vencimiento", val: fmtDate(data.fecha_vencimiento) },
          { lbl: "Empresa", val: emp.nombre },
          { lbl: "NIT", val: emp.nit },
          emp.matricula && { lbl: "Matr.", val: emp.matricula },
          { lbl: "Dirección", val: emp.direccion },
          { lbl: "Teléfono", val: emp.telefono },
          { lbl: "Email", val: emp.email },
          emp.pagina_web && { lbl: "Web", val: emp.pagina_web },
        ].filter(Boolean).map((item, i, arr) => (
          <div key={i}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.5)", marginBottom: 4, fontWeight: 600 }}>{item.lbl}</div>
              <div style={{ fontSize: item.big ? 22 : 12, color: "rgba(255,255,255,0.9)", fontWeight: item.big ? 900 : 400, lineHeight: 1.3, wordBreak: "break-word" }}>{item.val}</div>
            </div>
            {(item.lbl === "Número" || item.lbl === "Vencimiento" || item.lbl === "Estado") && (
              <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.15)", margin: "0 0 20px" }} />
            )}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "44px 44px 32px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, fontStyle: "italic", letterSpacing: 3, textTransform: "uppercase", color: ac, marginBottom: 6 }}>Documento de venta</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#1a1a1a", lineHeight: 1, marginBottom: 20 }}>{tipo}</div>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${ac} 60%, transparent)`, marginBottom: 28 }} />

        {/* Info cliente */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px", marginBottom: 32 }}>
          {[
            { lbl: "Cliente", val: cli.nombre_razon_social },
            { lbl: "Vendedor", val: `${usr.nombres} ${usr.apellidos}` },
            { lbl: "Documento", val: `${cli.tipo_documento}: ${cli.num_documento}` },
            { lbl: "Dirección cliente", val: cli.direccion },
          ].map(({ lbl, val }) => (
            <div key={lbl}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: "#aaa", marginBottom: 2, fontWeight: 600 }}>{lbl}</div>
              <div style={{ fontSize: 13, color: "#222", fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", marginBottom: 28 }}>
          <thead>
            <tr>
              {["#", "Producto", "Cantidad", "Valor unitario", hasDesc && "Descuento", "Total línea"].filter(Boolean).map((h, i) => (
                <th key={i} style={{ background: ac, color: "white", padding: "10px 12px", textAlign: i > 1 ? "right" : i === 0 ? "center" : "left", fontSize: 9, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineas.map((l, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#faf8f6" }}>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #ede9e3", textAlign: "center" }}>{i + 1}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #ede9e3" }}>{l.descripcion_manual || l.item?.nombre}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #ede9e3", textAlign: "right" }}>{l.cantidad}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #ede9e3", textAlign: "right" }}>{fmtMoney(l.valor_unitario)}</td>
                {hasDesc && <td style={{ padding: "10px 12px", borderBottom: "1px solid #ede9e3", textAlign: "right" }}>{fmtMoney(l.descuento)}</td>}
                <td style={{ padding: "10px 12px", borderBottom: "1px solid #ede9e3", textAlign: "right", fontWeight: 700 }}>{fmtMoney(l.total_linea)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
          <div style={{ width: 252, fontSize: 13 }}>
            {[
              { lbl: "Subtotal", val: fmtMoney(data.subtotal) },
              parseFloat(data.total_descuentos) > 0 && { lbl: "Descuentos", val: `-${fmtMoney(data.total_descuentos)}` },
              { lbl: "IVA", val: fmtMoney(data.total_iva) },
            ].filter(Boolean).map(({ lbl, val }) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #ede9e3", color: "#444" }}>
                <span>{lbl}</span><span>{val}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "2px solid #1a1a1a", borderBottom: "2px solid #1a1a1a", fontSize: 16, fontWeight: 700, color: "#111", marginTop: 4 }}>
              <span>TOTAL</span><span>{fmtMoney(data.total)}</span>
            </div>
            {data.estado !== "BORRADOR" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #ede9e3", color: "#444" }}>
                  <span>Pagado</span><span>{fmtMoney(totalPagado)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#444" }}>
                  <span>Saldo pendiente</span><span>{fmtMoney(saldo)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notas */}
        {data.notas && (
          <div style={{ borderLeft: `3px solid ${ac}`, padding: "12px 16px", background: "#faf8f6", fontSize: 13, color: "#555", marginBottom: 32 }}>
            <strong style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#999", marginBottom: 4 }}>Notas</strong>
            {data.notas}
          </div>
        )}

        {/* Firma */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 160, borderTop: "1px dashed #ccc", paddingTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#222" }}>{usr.nombres} {usr.apellidos}</div>
            <div style={{ fontSize: 11, color: "#888", fontStyle: "italic" }}>Vendedor</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", borderTop: "1px solid #e5e0db", paddingTop: 14, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 }}>
          <span>{emp.nombre}</span>
          <span>NIT: {emp.nit}</span>
          <span>{emp.direccion}</span>
          <span>Tel: {emp.telefono}</span>
          <span>{emp.email}</span>
        </div>
      </div>
    </div>
  );
}

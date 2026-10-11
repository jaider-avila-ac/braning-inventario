import { fmtMoney, fmtDate } from "./docUtils";

export default function Formato3({ data, emp, logoUrl, accentColor, tipo }) {
  const cli = data.cliente ?? {};
  const usr = data.usuario ?? {};
  const lineas = data.lineas ?? [];
  const hasDesc = lineas.some(l => parseFloat(l.descuento) > 0);
  const saldo = parseFloat(data.saldo) || 0;
  const totalPagado = parseFloat(data.total_pagado) || 0;
  const ac = accentColor || "#0d7377";

  return (
    <div style={{ background: "white", padding: "60px 64px", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: 900 }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "flex-start", marginBottom: 48 }}>
        <div>
          {logoUrl && <img src={logoUrl} alt="logo" style={{ height: 44, marginBottom: 4 }} />}
          {emp.nombre && <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{emp.nombre}</div>}
          {(emp.nit || emp.matricula) && (
            <div style={{ fontSize: 10, color: "#999", marginTop: 3 }}>
              {[emp.nit && `NIT: ${emp.nit}`, emp.matricula && `Matr.: ${emp.matricula}`].filter(Boolean).join(" · ")}
            </div>
          )}
          {(emp.telefono || emp.email) && (
            <div style={{ fontSize: 10, color: "#999" }}>{[emp.telefono, emp.email].filter(Boolean).join(" · ")}</div>
          )}
          {emp.pagina_web && <div style={{ fontSize: 10, color: "#999" }}>{emp.pagina_web}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 3, color: "#bbb", fontWeight: 500, marginBottom: 6 }}>{tipo} de venta</div>
          <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 500, color: ac, lineHeight: 1 }}>{data.numero || "—"}</div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Estado: {data.estado}</div>
        </div>
      </div>

      {/* Línea separadora */}
      <div style={{ height: 2, background: ac, opacity: 0.6, marginBottom: 40 }} />

      {/* Info cliente/vendedor/fechas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px 24px", marginBottom: 44 }}>
        {[
          { lbl: "Cliente", val: cli.nombre_razon_social, span: 2 },
          { lbl: "Emisión", val: fmtDate(data.fecha) },
          data.fecha_vencimiento && { lbl: "Vencimiento", val: fmtDate(data.fecha_vencimiento) },
          { lbl: "Documento", val: `${cli.tipo_documento}: ${cli.num_documento}` },
          { lbl: "Dirección", val: cli.direccion },
          { lbl: "Vendedor", val: `${usr.nombres} ${usr.apellidos}` },
        ].filter(Boolean).map(({ lbl, val, span }, i) => (
          <div key={i} style={span ? { gridColumn: `span ${span}` } : {}}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: "#bbb", fontWeight: 600, marginBottom: 5 }}>{lbl}</div>
            <div style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500, lineHeight: 1.4 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Tabla — sin bordes, solo líneas horizontales */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 36 }}>
        <thead>
          <tr>
            {["#", "Producto / Descripción", "Cant.", "Valor unit.", hasDesc && "Descuento", "Total"].filter(Boolean).map((h, i) => (
              <th key={i} style={{ borderBottom: `1px solid ${ac}`, padding: "8px 0 10px", textAlign: i > 1 ? "right" : "left", fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: ac, fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lineas.map((l, i) => (
            <tr key={i}>
              <td style={{ padding: "12px 0", borderBottom: "1px solid #f0f0ee", fontFamily: "monospace", fontSize: 11, color: "#ccc" }}>{String(i + 1).padStart(2, "0")}</td>
              <td style={{ padding: "12px 0", borderBottom: "1px solid #f0f0ee", color: "#333" }}>{l.descripcion_manual || l.item?.nombre}</td>
              <td style={{ padding: "12px 0", borderBottom: "1px solid #f0f0ee", textAlign: "right", color: "#333" }}>{l.cantidad}</td>
              <td style={{ padding: "12px 0", borderBottom: "1px solid #f0f0ee", textAlign: "right", color: "#333" }}>{fmtMoney(l.valor_unitario)}</td>
              {hasDesc && <td style={{ padding: "12px 0", borderBottom: "1px solid #f0f0ee", textAlign: "right", color: "#333" }}>{fmtMoney(l.descuento)}</td>}
              <td style={{ padding: "12px 0", borderBottom: "1px solid #f0f0ee", textAlign: "right", fontFamily: "monospace", fontWeight: 500, color: "#111" }}>{fmtMoney(l.total_linea)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Notas + Totales lado a lado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 44, gap: 40 }}>
        <div style={{ flex: 1 }}>
          {data.notas && (
            <>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: "#bbb", fontWeight: 600, marginBottom: 8 }}>Notas</div>
              <div style={{ fontSize: 13, color: "#666", fontWeight: 300, fontStyle: "italic", lineHeight: 1.5 }}>{data.notas}</div>
            </>
          )}
        </div>
        <div style={{ width: 220, flexShrink: 0 }}>
          {[
            { lbl: "Subtotal", val: fmtMoney(data.subtotal) },
            parseFloat(data.total_descuentos) > 0 && { lbl: "Descuentos", val: `-${fmtMoney(data.total_descuentos)}` },
            { lbl: "IVA", val: fmtMoney(data.total_iva) },
          ].filter(Boolean).map(({ lbl, val }) => (
            <div key={lbl} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13, color: "#666", borderBottom: "1px solid #f0f0ee" }}>
              <span>{lbl}</span><span style={{ fontFamily: "monospace", fontSize: 12, color: "#555" }}>{val}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid #1a1a1a", borderBottom: "2px solid #1a1a1a", fontSize: 14, fontWeight: 700, color: "#111", marginTop: 6 }}>
            <span>TOTAL</span><span style={{ fontFamily: "monospace", fontSize: 15 }}>{fmtMoney(data.total)}</span>
          </div>
          {data.estado !== "BORRADOR" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13, color: "#666", borderBottom: "1px solid #f0f0ee" }}>
                <span>Pagado</span><span style={{ fontFamily: "monospace", fontSize: 12 }}>{fmtMoney(totalPagado)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13, color: "#666" }}>
                <span>Saldo pendiente</span><span style={{ fontFamily: "monospace", fontSize: 12 }}>{fmtMoney(saldo)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Firma + Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #e8e8e6", paddingTop: 28 }}>
        <div>
          <div style={{ width: 120, height: 1, borderTop: "1px dashed #ddd", marginBottom: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{usr.nombres} {usr.apellidos}</div>
          <div style={{ fontSize: 11, color: "#aaa", fontStyle: "italic", marginTop: 2 }}>Vendedor</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#ccc", textTransform: "uppercase", letterSpacing: 1, lineHeight: 1.8 }}>
          <div>{emp.nombre} — NIT: {emp.nit}{emp.matricula ? ` — Matr.: ${emp.matricula}` : ""}</div>
          <div>{emp.direccion} · Tel: {emp.telefono}</div>
          <div>{emp.email}{emp.pagina_web ? ` · ${emp.pagina_web}` : ""}</div>
        </div>
      </div>
    </div>
  );
}

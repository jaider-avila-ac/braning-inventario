import { fmtMoney, fmtDate } from "./docUtils";

export default function Formato1({ data, emp, logoUrl, accentColor, tipo }) {
  const cli = data.cliente ?? {};
  const usr = data.usuario ?? {};
  const lineas = data.lineas ?? [];
  const hasDesc = lineas.some(l => parseFloat(l.descuento) > 0);
  const saldo = parseFloat(data.saldo) || 0;
  const totalPagado = parseFloat(data.total_pagado) || 0;

  const ac = accentColor || "#1d4ed8";

  return (
    <div style={{ fontFamily: "sans-serif", background: "white", padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {logoUrl && <img src={logoUrl} alt="logo" style={{ height: 48, marginBottom: 6 }} />}
          {emp.nombre && <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{emp.nombre}</div>}
          {emp.nit && <div style={{ fontSize: 11, color: "#6b7280" }}>NIT: {emp.nit}</div>}
          {emp.matricula && <div style={{ fontSize: 11, color: "#6b7280" }}>Matr.: {emp.matricula}</div>}
          {(emp.telefono || emp.email) && <div style={{ fontSize: 11, color: "#6b7280" }}>{[emp.telefono, emp.email].filter(Boolean).join(" · ")}</div>}
          {emp.pagina_web && <div style={{ fontSize: 11, color: "#6b7280" }}>{emp.pagina_web}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 2 }}>{tipo}</p>
          {data.numero && <p style={{ fontSize: 28, fontWeight: 900, color: ac }}>{data.numero}</p>}
          <p style={{ fontSize: 12, marginTop: 4 }}>
            <span style={{ fontWeight: 600, color: "#374151" }}>Estado: </span>{data.estado}
          </p>
        </div>
      </div>

      {/* Línea decorativa */}
      <div style={{ marginTop: 16, borderTop: `4px solid ${ac}`, opacity: 0.3 }} />

      {/* Info cliente */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24, fontSize: 13 }}>
        <div>
          <p><span style={{ fontWeight: 600 }}>CLIENTE:</span> {cli.nombre_razon_social}</p>
          <p><span style={{ fontWeight: 600 }}>DOCUMENTO:</span> {cli.tipo_documento}: {cli.num_documento}</p>
          <p><span style={{ fontWeight: 600 }}>DIRECCIÓN:</span> {cli.direccion}</p>
          <p><span style={{ fontWeight: 600 }}>FECHA EMISIÓN: </span>
            <span style={{ color: ac, fontWeight: 600 }}>{fmtDate(data.fecha)}</span>
          </p>
        </div>
        <div>
          <p><span style={{ fontWeight: 600 }}>VENDEDOR:</span> {usr.nombres} {usr.apellidos}</p>
          {data.fecha_vencimiento && (
            <p><span style={{ fontWeight: 600 }}>FECHA VENCIMIENTO:</span> {fmtDate(data.fecha_vencimiento)}</p>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ marginTop: 24 }}>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: ac, color: "white" }}>
              <th style={{ padding: "8px 8px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "left" }}>#</th>
              <th style={{ padding: "8px 8px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "left" }}>Producto</th>
              <th style={{ padding: "8px 8px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "right" }}>Cantidad</th>
              <th style={{ padding: "8px 8px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "right" }}>Valor Unit.</th>
              {hasDesc && <th style={{ padding: "8px 8px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "right" }}>Descuento</th>}
              <th style={{ padding: "8px 8px", border: "1px solid rgba(255,255,255,0.2)", textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {lineas.map((l, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                <td style={{ padding: "8px 8px", border: "1px solid #e5e7eb", textAlign: "center" }}>{i + 1}</td>
                <td style={{ padding: "8px 8px", border: "1px solid #e5e7eb" }}>{l.descripcion_manual || l.item?.nombre}</td>
                <td style={{ padding: "8px 8px", border: "1px solid #e5e7eb", textAlign: "center" }}>{l.cantidad}</td>
                <td style={{ padding: "8px 8px", border: "1px solid #e5e7eb", textAlign: "right" }}>{fmtMoney(l.valor_unitario)}</td>
                {hasDesc && <td style={{ padding: "8px 8px", border: "1px solid #e5e7eb", textAlign: "right" }}>{fmtMoney(l.descuento)}</td>}
                <td style={{ padding: "8px 8px", border: "1px solid #e5e7eb", textAlign: "right", fontWeight: 600 }}>{fmtMoney(l.total_linea)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <div style={{ width: 256, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#6b7280" }}>
            <span>Subtotal:</span><span>{fmtMoney(data.subtotal)}</span>
          </div>
          {parseFloat(data.total_descuentos) > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#6b7280" }}>
              <span>Descuentos:</span><span>-{fmtMoney(data.total_descuentos)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#6b7280" }}>
            <span>IVA:</span><span>{fmtMoney(data.total_iva)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "2px solid #111", fontWeight: 700, fontSize: 15, color: "#111" }}>
            <span>TOTAL:</span><span>{fmtMoney(data.total)}</span>
          </div>
          {data.estado !== "BORRADOR" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderTop: "1px solid #e5e7eb", fontWeight: 600, color: "#374151" }}>
                <span>Pagado:</span><span>{fmtMoney(totalPagado)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontWeight: 600, color: "#374151" }}>
                <span>Saldo pendiente:</span><span>{fmtMoney(saldo)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notas */}
      {data.notas && (
        <div style={{ marginTop: 24, fontSize: 13, textAlign: "center", background: "#f9fafb", padding: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <p style={{ fontWeight: 600 }}>NOTAS:</p>
          <p style={{ color: "#6b7280", marginTop: 4 }}>{data.notas}</p>
        </div>
      )}

      {/* Firma */}
      <div style={{ marginTop: 40 }}>
        <div style={{ borderTop: "1px dashed #d1d5db", paddingTop: 16, display: "inline-block" }}>
          <p style={{ fontWeight: 600, fontSize: 13 }}>{usr.nombres} {usr.apellidos}</p>
          <p style={{ fontSize: 12, color: "#6b7280" }}>Vendedor</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, borderTop: "1px solid #e5e7eb", paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>
        <span>{emp.nombre}</span>
        <span>NIT: {emp.nit}</span>
        {emp.matricula && <span>Matr.: {emp.matricula}</span>}
        <span>{emp.direccion}</span>
        <span>Tel: {emp.telefono}</span>
        <span>{emp.email}</span>
        {emp.pagina_web && <span>{emp.pagina_web}</span>}
      </div>
    </div>
  );
}

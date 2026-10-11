import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v || 0);

const fmtDate = (d) => {
  if (!d) return "—";
  const [y, m, day] = String(d).split("-");
  return `${day}/${m}/${y}`;
};

/* ─── Componentes compartidos ─────────────────────────────────────── */

function Tabla({ lineas, hasDesc, ac }) {
  return (
    <View>
      <View style={{ flexDirection: "row", backgroundColor: ac, paddingVertical: 5, paddingHorizontal: 6 }}>
        <Text style={{ width: 18, fontSize: 7, color: "white", fontFamily: "Helvetica-Bold" }}>#</Text>
        <Text style={{ flex: 1, fontSize: 7, color: "white", fontFamily: "Helvetica-Bold" }}>Producto / Descripción</Text>
        <Text style={{ width: 34, fontSize: 7, color: "white", fontFamily: "Helvetica-Bold", textAlign: "right" }}>Cant.</Text>
        <Text style={{ width: 64, fontSize: 7, color: "white", fontFamily: "Helvetica-Bold", textAlign: "right" }}>Valor unit.</Text>
        {hasDesc && <Text style={{ width: 56, fontSize: 7, color: "white", fontFamily: "Helvetica-Bold", textAlign: "right" }}>Descuento</Text>}
        <Text style={{ width: 64, fontSize: 7, color: "white", fontFamily: "Helvetica-Bold", textAlign: "right" }}>Total</Text>
      </View>
      {lineas.map((l, i) => (
        <View key={i} style={{ flexDirection: "row", backgroundColor: i % 2 === 0 ? "white" : "#f9fafb", paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" }}>
          <Text style={{ width: 18, fontSize: 7.5, color: "#9ca3af" }}>{i + 1}</Text>
          <Text style={{ flex: 1, fontSize: 7.5, color: "#1a1a1a" }}>{l.descripcion_manual || l.item?.nombre}</Text>
          <Text style={{ width: 34, fontSize: 7.5, color: "#1a1a1a", textAlign: "right" }}>{l.cantidad}</Text>
          <Text style={{ width: 64, fontSize: 7.5, color: "#1a1a1a", textAlign: "right" }}>{fmt(l.valor_unitario)}</Text>
          {hasDesc && <Text style={{ width: 56, fontSize: 7.5, color: "#1a1a1a", textAlign: "right" }}>{fmt(l.descuento)}</Text>}
          <Text style={{ width: 64, fontSize: 7.5, color: "#1a1a1a", textAlign: "right", fontFamily: "Helvetica-Bold" }}>{fmt(l.total_linea)}</Text>
        </View>
      ))}
    </View>
  );
}

function Totales({ data, ac }) {
  const totalPagado = parseFloat(data.total_pagado) || 0;
  const saldo = parseFloat(data.saldo) || 0;
  return (
    <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
      <View style={{ width: 188 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
          <Text style={{ fontSize: 8, color: "#6b7280" }}>Subtotal:</Text>
          <Text style={{ fontSize: 8, color: "#1a1a1a" }}>{fmt(data.subtotal)}</Text>
        </View>
        {parseFloat(data.total_descuentos) > 0 && (
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
            <Text style={{ fontSize: 8, color: "#6b7280" }}>Descuentos:</Text>
            <Text style={{ fontSize: 8, color: "#1a1a1a" }}>-{fmt(data.total_descuentos)}</Text>
          </View>
        )}
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
          <Text style={{ fontSize: 8, color: "#6b7280" }}>IVA:</Text>
          <Text style={{ fontSize: 8, color: "#1a1a1a" }}>{fmt(data.total_iva)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderTopWidth: 1.5, borderTopColor: "#111", marginTop: 2 }}>
          <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>TOTAL:</Text>
          <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: ac }}>{fmt(data.total)}</Text>
        </View>
        {data.estado !== "BORRADOR" && (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
              <Text style={{ fontSize: 8, color: "#6b7280" }}>Pagado:</Text>
              <Text style={{ fontSize: 8 }}>{fmt(totalPagado)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#374151" }}>Saldo pendiente:</Text>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#374151" }}>{fmt(saldo)}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

function Firma({ usr }) {
  return (
    <View style={{ marginTop: 24, flexDirection: "row", gap: 32 }}>
      <View style={{ flex: 1 }}>
        <View style={{ height: 36 }} />
        <View style={{ borderTopWidth: 1, borderTopColor: "#9ca3af", borderTopStyle: "dashed", width: 160, paddingTop: 4 }}>
          <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>{usr.nombres} {usr.apellidos}</Text>
          <Text style={{ fontSize: 7, color: "#6b7280" }}>Firma del vendedor</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ height: 36 }} />
        <View style={{ borderTopWidth: 1, borderTopColor: "#9ca3af", borderTopStyle: "dashed", width: 160, paddingTop: 4 }}>
          <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}> </Text>
          <Text style={{ fontSize: 7, color: "#6b7280" }}>Firma del cliente / Recibido</Text>
        </View>
      </View>
    </View>
  );
}

/* ─── Formato 1: Original con tabla bordeada ──────────────────────── */
function F1({ data, emp, logoUrl, ac, tipo }) {
  const cli = data.cliente ?? {};
  const usr = data.usuario ?? {};
  const lineas = data.lineas ?? [];
  const hasDesc = lineas.some((l) => parseFloat(l.descuento) > 0);

  return (
    <View style={{ padding: 30, fontFamily: "Helvetica" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View>
          {logoUrl && <Image src={logoUrl} style={{ width: 80, height: 36, objectFit: "contain", marginBottom: 4 }} />}
          {emp.nombre && <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold" }}>{emp.nombre}</Text>}
          {emp.nit && <Text style={{ fontSize: 7.5, color: "#6b7280", marginTop: 1 }}>NIT: {emp.nit}{emp.matricula ? ` · Matr.: ${emp.matricula}` : ""}</Text>}
          {(emp.telefono || emp.email) && <Text style={{ fontSize: 7.5, color: "#6b7280", marginTop: 1 }}>{[emp.telefono, emp.email].filter(Boolean).join(" · ")}</Text>}
          {emp.pagina_web && <Text style={{ fontSize: 7.5, color: "#6b7280", marginTop: 1 }}>{emp.pagina_web}</Text>}
          {emp.direccion && <Text style={{ fontSize: 7.5, color: "#6b7280", marginTop: 1 }}>{emp.direccion}</Text>}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 7, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>{tipo}</Text>
          {data.numero && <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: ac, marginTop: 2 }}>{data.numero}</Text>}
          <Text style={{ fontSize: 8, color: "#374151", marginTop: 2 }}>Estado: {data.estado}</Text>
        </View>
      </View>

      {/* Divisor */}
      <View style={{ marginVertical: 10, borderTopWidth: 3, borderTopColor: ac, opacity: 0.3 }} />

      {/* Info cliente / fechas */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <View style={{ flex: 2, marginRight: 12 }}>
          <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", textTransform: "uppercase", marginBottom: 2 }}>Cliente</Text>
          <Text style={{ fontSize: 8.5 }}>{cli.nombre_razon_social}</Text>
          {cli.tipo_documento && <Text style={{ fontSize: 8 }}>{cli.tipo_documento}: {cli.num_documento}</Text>}
          {cli.direccion && <Text style={{ fontSize: 8, color: "#6b7280" }}>{cli.direccion}</Text>}
        </View>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", textTransform: "uppercase", marginBottom: 2 }}>Emisión</Text>
          <Text style={{ fontSize: 8.5 }}>{fmtDate(data.fecha)}</Text>
          {data.fecha_vencimiento && <>
            <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", textTransform: "uppercase", marginTop: 4, marginBottom: 2 }}>Vencimiento</Text>
            <Text style={{ fontSize: 8.5 }}>{fmtDate(data.fecha_vencimiento)}</Text>
          </>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: "#374151", textTransform: "uppercase", marginBottom: 2 }}>Vendedor</Text>
          <Text style={{ fontSize: 8.5 }}>{usr.nombres} {usr.apellidos}</Text>
        </View>
      </View>

      <Tabla lineas={lineas} hasDesc={hasDesc} ac={ac} />
      <Totales data={data} ac={ac} />

      {data.notas && (
        <View style={{ marginTop: 10, backgroundColor: "#f9fafb", padding: 8, borderRadius: 4, borderWidth: 0.5, borderColor: "#e5e7eb" }}>
          <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 3 }}>Notas:</Text>
          <Text style={{ fontSize: 8, color: "#6b7280" }}>{data.notas}</Text>
        </View>
      )}

      <Firma usr={usr} />
    </View>
  );
}

/* ─── Formato 2: Clásico con sidebar ─────────────────────────────── */
function F2({ data, emp, logoUrl, ac, tipo }) {
  const cli = data.cliente ?? {};
  const usr = data.usuario ?? {};
  const lineas = data.lineas ?? [];
  const hasDesc = lineas.some((l) => parseFloat(l.descuento) > 0);

  const sideItems = [
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
  ].filter(Boolean);

  return (
    <View style={{ flexDirection: "row", minHeight: 792, fontFamily: "Helvetica" }}>
      {/* Sidebar */}
      <View style={{ width: 150, backgroundColor: ac, padding: 20, flexShrink: 0 }}>
        {logoUrl && <Image src={logoUrl} style={{ width: 100, height: 40, objectFit: "contain", marginBottom: 16, filter: "brightness(0) invert(1)" }} />}
        {sideItems.map((item, i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.55)", marginBottom: 2, fontFamily: "Helvetica-Bold" }}>{item.lbl}</Text>
            <Text style={{ fontSize: item.big ? 18 : 9, color: "rgba(255,255,255,0.9)", fontFamily: item.big ? "Helvetica-Bold" : "Helvetica", lineHeight: 1.3 }}>{item.val}</Text>
            {(item.lbl === "Número" || item.lbl === "Estado" || item.lbl === "Vencimiento") && (
              <View style={{ borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.2)", marginTop: 10 }} />
            )}
          </View>
        ))}
      </View>

      {/* Main */}
      <View style={{ flex: 1, padding: 28 }}>
        <Text style={{ fontSize: 9, color: ac, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4, fontStyle: "italic" }}>Documento de venta</Text>
        <Text style={{ fontSize: 26, fontFamily: "Helvetica-Bold", color: "#1a1a1a", marginBottom: 8 }}>{tipo}</Text>
        <View style={{ height: 2, backgroundColor: ac, marginBottom: 16 }} />

        {/* Info cliente */}
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          {[
            { lbl: "Cliente", val: cli.nombre_razon_social },
            { lbl: "Vendedor", val: `${usr.nombres} ${usr.apellidos}` },
            { lbl: "Documento", val: `${cli.tipo_documento}: ${cli.num_documento}` },
            { lbl: "Dirección", val: cli.direccion },
          ].map(({ lbl, val }, i) => (
            <View key={i} style={{ flex: 1, marginRight: i < 3 ? 10 : 0 }}>
              <Text style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: 1, color: "#aaa", marginBottom: 2, fontFamily: "Helvetica-Bold" }}>{lbl}</Text>
              <Text style={{ fontSize: 9, color: "#222", fontFamily: "Helvetica-Bold" }}>{val}</Text>
            </View>
          ))}
        </View>

        <Tabla lineas={lineas} hasDesc={hasDesc} ac={ac} />
        <Totales data={data} ac={ac} />

        {data.notas && (
          <View style={{ marginTop: 10, padding: 8, backgroundColor: "#faf8f6", borderWidth: 0.5, borderColor: "#ede9e3", borderRadius: 4 }}>
            <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 3 }}>Notas:</Text>
            <Text style={{ fontSize: 8, color: "#6b7280" }}>{data.notas}</Text>
          </View>
        )}

        <Firma usr={usr} />
      </View>
    </View>
  );
}

/* ─── Formato 3: Minimal sin bordes ──────────────────────────────── */
function F3({ data, emp, logoUrl, ac, tipo }) {
  const cli = data.cliente ?? {};
  const usr = data.usuario ?? {};
  const lineas = data.lineas ?? [];
  const hasDesc = lineas.some((l) => parseFloat(l.descuento) > 0);

  return (
    <View style={{ padding: "36pt 40pt", fontFamily: "Helvetica" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <View>
          {logoUrl && <Image src={logoUrl} style={{ width: 80, height: 36, objectFit: "contain", marginBottom: 4 }} />}
          {emp.nombre && <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold" }}>{emp.nombre}</Text>}
          {(emp.nit || emp.matricula) && (
            <Text style={{ fontSize: 7, color: "#999", marginTop: 2 }}>
              {[emp.nit && `NIT: ${emp.nit}`, emp.matricula && `Matr.: ${emp.matricula}`].filter(Boolean).join(" · ")}
            </Text>
          )}
          {(emp.telefono || emp.email) && <Text style={{ fontSize: 7, color: "#999", marginTop: 1 }}>{[emp.telefono, emp.email].filter(Boolean).join(" · ")}</Text>}
          {emp.pagina_web && <Text style={{ fontSize: 7, color: "#999", marginTop: 1 }}>{emp.pagina_web}</Text>}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: 2, color: "#bbb" }}>{tipo} de venta</Text>
          <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: ac, marginTop: 4 }}>{data.numero || "—"}</Text>
          <Text style={{ fontSize: 7, color: "#888", marginTop: 3, textTransform: "uppercase", letterSpacing: 1 }}>Estado: {data.estado}</Text>
        </View>
      </View>

      <View style={{ height: 1.5, backgroundColor: ac, opacity: 0.6, marginBottom: 16 }} />

      {/* Info 4 columnas */}
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {[
          { lbl: "Cliente", val: `${cli.nombre_razon_social}\n${cli.tipo_documento}: ${cli.num_documento}${cli.direccion ? `\n${cli.direccion}` : ""}`, span: 2 },
          { lbl: "Emisión", val: fmtDate(data.fecha) + (data.fecha_vencimiento ? `\nVenc.: ${fmtDate(data.fecha_vencimiento)}` : "") },
          { lbl: "Vendedor", val: `${usr.nombres} ${usr.apellidos}` },
        ].map(({ lbl, val, span }, i) => (
          <View key={i} style={{ flex: span ?? 1, marginRight: i < 2 ? 12 : 0 }}>
            <Text style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, color: "#bbb", fontFamily: "Helvetica-Bold", marginBottom: 3 }}>{lbl}</Text>
            <Text style={{ fontSize: 8.5, color: "#1a1a1a", lineHeight: 1.5 }}>{val}</Text>
          </View>
        ))}
      </View>

      {/* Tabla sin bordes */}
      <View>
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: ac, paddingBottom: 5, paddingHorizontal: 0 }}>
          <Text style={{ width: 18, fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, color: ac, fontFamily: "Helvetica-Bold" }}>#</Text>
          <Text style={{ flex: 1, fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, color: ac, fontFamily: "Helvetica-Bold" }}>Producto / Descripción</Text>
          <Text style={{ width: 34, fontSize: 7, textTransform: "uppercase", letterSpacing: 1, color: ac, fontFamily: "Helvetica-Bold", textAlign: "right" }}>Cant.</Text>
          <Text style={{ width: 64, fontSize: 7, textTransform: "uppercase", letterSpacing: 1, color: ac, fontFamily: "Helvetica-Bold", textAlign: "right" }}>Valor unit.</Text>
          {hasDesc && <Text style={{ width: 56, fontSize: 7, textTransform: "uppercase", letterSpacing: 1, color: ac, fontFamily: "Helvetica-Bold", textAlign: "right" }}>Desc.</Text>}
          <Text style={{ width: 64, fontSize: 7, textTransform: "uppercase", letterSpacing: 1, color: ac, fontFamily: "Helvetica-Bold", textAlign: "right" }}>Total</Text>
        </View>
        {lineas.map((l, i) => (
          <View key={i} style={{ flexDirection: "row", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#f0f0ee" }}>
            <Text style={{ width: 18, fontSize: 7.5, color: "#ccc", fontFamily: "Helvetica-Bold" }}>{String(i + 1).padStart(2, "0")}</Text>
            <Text style={{ flex: 1, fontSize: 8, color: "#333" }}>{l.descripcion_manual || l.item?.nombre}</Text>
            <Text style={{ width: 34, fontSize: 8, color: "#333", textAlign: "right" }}>{l.cantidad}</Text>
            <Text style={{ width: 64, fontSize: 8, color: "#333", textAlign: "right" }}>{fmt(l.valor_unitario)}</Text>
            {hasDesc && <Text style={{ width: 56, fontSize: 8, color: "#333", textAlign: "right" }}>{fmt(l.descuento)}</Text>}
            <Text style={{ width: 64, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#111", textAlign: "right" }}>{fmt(l.total_linea)}</Text>
          </View>
        ))}
      </View>

      {/* Notas + Totales lado a lado */}
      <View style={{ flexDirection: "row", marginTop: 12, alignItems: "flex-start" }}>
        <View style={{ flex: 1, marginRight: 20 }}>
          {data.notas && (
            <>
              <Text style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, color: "#bbb", fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Notas</Text>
              <Text style={{ fontSize: 8, color: "#666", fontStyle: "italic", lineHeight: 1.5 }}>{data.notas}</Text>
            </>
          )}
        </View>
        <Totales data={data} ac={ac} />
      </View>

      <Firma usr={usr} />
    </View>
  );
}

/* ─── Formato 4: Corporativo con banda superior ───────────────────── */
function F4({ data, emp, logoUrl, ac, tipo }) {
  const cli = data.cliente ?? {};
  const usr = data.usuario ?? {};
  const lineas = data.lineas ?? [];
  const hasDesc = lineas.some((l) => parseFloat(l.descuento) > 0);

  return (
    <View style={{ fontFamily: "Helvetica" }}>
      {/* Banda superior */}
      <View style={{ backgroundColor: ac, padding: "20pt 28pt 16pt", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <View>
          {logoUrl
            ? <Image src={logoUrl} style={{ width: 80, height: 36, objectFit: "contain" }} />
            : <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: "white" }}>{emp.nombre}</Text>
          }
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: "white", textTransform: "uppercase" }}>{tipo} de Venta</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{data.numero}</Text>
          <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.8)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1, backgroundColor: "rgba(255,255,255,0.15)", paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 }}>{data.estado}</Text>
        </View>
      </View>

      {/* Sub-banda */}
      <View style={{ backgroundColor: ac, opacity: 0.85, padding: "8pt 28pt 14pt", flexDirection: "row" }}>
        {[
          { lbl: "Fecha emisión", val: fmtDate(data.fecha) },
          data.fecha_vencimiento && { lbl: "Fecha vencimiento", val: fmtDate(data.fecha_vencimiento) },
          { lbl: "Empresa", val: [emp.nombre, emp.nit && `NIT: ${emp.nit}`, emp.matricula && `Matr.: ${emp.matricula}`].filter(Boolean).join(" — ") },
          emp.pagina_web && { lbl: "Web", val: emp.pagina_web },
        ].filter(Boolean).map(({ lbl, val }) => (
          <View key={lbl} style={{ marginRight: 24 }}>
            <Text style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.55)", fontFamily: "Helvetica-Bold" }}>{lbl}</Text>
            <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.9)", marginTop: 2 }}>{val}</Text>
          </View>
        ))}
      </View>

      {/* Cuerpo */}
      <View style={{ padding: "20pt 28pt" }}>
        {/* Cards info */}
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <View style={{ flex: 1, marginRight: 12, borderWidth: 0.5, borderColor: "#e8ecf0", borderRadius: 6, padding: "10pt 12pt", backgroundColor: "#fafbfc" }}>
            <Text style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, color: ac, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>Datos del cliente</Text>
            {[
              { lbl: "Nombre", val: cli.nombre_razon_social },
              { lbl: "Documento", val: `${cli.tipo_documento}: ${cli.num_documento}` },
              { lbl: "Dirección", val: cli.direccion },
            ].map(({ lbl, val }) => (
              <View key={lbl} style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={{ fontSize: 7.5, color: "#999", width: 70 }}>{lbl}</Text>
                <Text style={{ fontSize: 7.5, color: "#222", fontFamily: "Helvetica-Bold", flex: 1 }}>{val}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1, borderWidth: 0.5, borderColor: "#e8ecf0", borderRadius: 6, padding: "10pt 12pt", backgroundColor: "#fafbfc" }}>
            <Text style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, color: ac, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>Datos de la venta</Text>
            {[
              { lbl: "Vendedor", val: `${usr.nombres} ${usr.apellidos}` },
              { lbl: "Emisión", val: fmtDate(data.fecha) },
              data.fecha_vencimiento && { lbl: "Vencimiento", val: fmtDate(data.fecha_vencimiento) },
            ].filter(Boolean).map(({ lbl, val }) => (
              <View key={lbl} style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={{ fontSize: 7.5, color: "#999", width: 70 }}>{lbl}</Text>
                <Text style={{ fontSize: 7.5, color: "#222", fontFamily: "Helvetica-Bold", flex: 1 }}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, color: ac, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>Detalle de productos y servicios</Text>
        <Tabla lineas={lineas} hasDesc={hasDesc} ac={ac} />
        <Totales data={data} ac={ac} />

        {data.notas && (
          <View style={{ marginTop: 10, borderLeftWidth: 2, borderLeftColor: ac, paddingLeft: 10, paddingVertical: 6, backgroundColor: "#f5f7f9" }}>
            <Text style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: 1.5, color: ac, fontFamily: "Helvetica-Bold", marginBottom: 3 }}>Observaciones</Text>
            <Text style={{ fontSize: 8, color: "#6b7280", fontStyle: "italic" }}>{data.notas}</Text>
          </View>
        )}

        <Firma usr={usr} />
      </View>
    </View>
  );
}

/* ─── Componente principal ────────────────────────────────────────── */
const FORMATOS = { "1": F1, "2": F2, "3": F3, "4": F4 };

export default function DocumentoPDF({ data, empresa, logoUrl, tipo }) {
  const tema = empresa?.doc_tema ?? "1";
  const ac = empresa?.doc_color || "#1d4ed8";
  const emp = empresa ?? {};
  const Formato = FORMATOS[tema] ?? F1;

  return (
    <Document>
      <Page size="LETTER" style={{ backgroundColor: "white" }}>
        <Formato data={data} emp={emp} logoUrl={logoUrl} ac={ac} tipo={tipo} />
      </Page>
    </Document>
  );
}

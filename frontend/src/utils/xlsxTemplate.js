import * as XLSX from "xlsx";

const TIPO_DOCUMENTO_VALIDOS = "CC, NIT, CE, PAS, OTRO";

const CLIENTES_CONFIG = {
  columns: ["empresa", "nombre_razon_social", "tipo_documento", "num_documento", "contacto", "email", "telefono", "direccion"],
  example: {
    empresa: "Acme Corp",
    nombre_razon_social: "Juan Pérez García",
    tipo_documento: "CC",
    num_documento: "1234567890",
    contacto: "Juan Pérez",
    email: "juan@acme.com",
    telefono: "3001234567",
    direccion: "Calle 123 #45-67, Bogotá",
  },
  filename: "plantilla_clientes.xlsx",
};

const PROVEEDORES_CONFIG = {
  columns: ["nombre", "nit", "contacto", "email", "telefono", "direccion"],
  example: {
    nombre: "Suministros XYZ S.A.S.",
    nit: "800987654",
    contacto: "María López",
    email: "maria@xyz.com",
    telefono: "3109876543",
    direccion: "Av. Principal #10-20, Medellín",
  },
  filename: "plantilla_proveedores.xlsx",
};

function generarPlantilla({ columns, example, filename }) {
  const header = columns;
  const exampleRow = columns.map(col => example[col] ?? "");

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, exampleRow]);
  ws["!cols"] = columns.map(() => ({ wch: 26 }));

  // Comentario visible en la celda tipo_documento
  const tipoDocIdx = columns.indexOf("tipo_documento");
  if (tipoDocIdx >= 0) {
    const ref = XLSX.utils.encode_cell({ r: 0, c: tipoDocIdx });
    ws[ref].c = [{ a: "Sistema", t: `Valores válidos: ${TIPO_DOCUMENTO_VALIDOS}` }];
  }

  // Comentario visible en la celda email
  const emailIdx = columns.indexOf("email");
  if (emailIdx >= 0) {
    const ref = XLSX.utils.encode_cell({ r: 0, c: emailIdx });
    ws[ref].c = [{ a: "Sistema", t: "Debe contener @ — ejemplo: nombre@dominio.com" }];
  }

  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, filename);
}

export const descargarPlantillaClientes = () => generarPlantilla(CLIENTES_CONFIG);
export const descargarPlantillaProveedores = () => generarPlantilla(PROVEEDORES_CONFIG);

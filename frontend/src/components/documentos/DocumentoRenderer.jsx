import Formato1 from "./Formato1";
import Formato2 from "./Formato2";
import Formato3 from "./Formato3";
import Formato4 from "./Formato4";

const FORMATOS = { "1": Formato1, "2": Formato2, "3": Formato3, "4": Formato4 };

export default function DocumentoRenderer({ data, empresa, logoUrl, tipo }) {
  const tema = empresa?.doc_tema ?? "1";
  const accentColor = empresa?.doc_color ?? "#1d4ed8";
  const Componente = FORMATOS[tema] ?? Formato1;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 print:shadow-none print:border-none overflow-hidden">
      <Componente
        data={data}
        emp={empresa ?? {}}
        logoUrl={logoUrl}
        accentColor={accentColor}
        tipo={tipo}
      />
    </div>
  );
}

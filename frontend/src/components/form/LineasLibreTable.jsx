import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

const numCls = (extra = "") =>
  `w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${extra}`;

const txtCls = (hasError) =>
  `w-full px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
    hasError ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"
  }`;

const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v || 0);

function LineaLibreRow({ linea, index, modoIva, ivaGlobal, onUpdate, onRemove, isEditable, submitted }) {
  const base = linea.cantidad * linea.valor_unitario;
  const subtotal = base - (linea.descuento || 0);
  const pct = modoIva === "global" ? ivaGlobal : (linea.iva_pct || 0);
  const total = subtotal * (1 + pct / 100);

  const descError = submitted && !linea.descripcion?.trim();

  return (
    <tr className="border-b hover:bg-gray-50 align-middle">
      <td className="p-2 min-w-52">
        <input
          className={txtCls(descError)}
          value={linea.descripcion}
          onChange={e => onUpdate(index, "descripcion", e.target.value)}
          placeholder="Descripción *"
          disabled={!isEditable}
        />
      </td>
      <td className="p-2 w-20">
        <input
          className={numCls("w-20")}
          type="number"
          min="1"
          value={linea.cantidad}
          onChange={e => onUpdate(index, "cantidad", +e.target.value)}
          disabled={!isEditable}
        />
      </td>
      <td className="p-2 w-28">
        <input
          className={numCls("w-28")}
          type="number"
          min="0"
          value={linea.valor_unitario}
          onChange={e => onUpdate(index, "valor_unitario", +e.target.value)}
          disabled={!isEditable}
        />
      </td>
      <td className="p-2 w-24">
        <input
          className={numCls("w-24")}
          type="number"
          min="0"
          value={linea.descuento}
          onChange={e => onUpdate(index, "descuento", +e.target.value)}
          disabled={!isEditable}
        />
      </td>
      {modoIva === "linea" && (
        <td className="p-2 w-16">
          <input
            className={numCls("w-16 text-center")}
            type="number"
            min="0"
            value={linea.iva_pct}
            onChange={e => onUpdate(index, "iva_pct", +e.target.value)}
            disabled={!isEditable}
          />
        </td>
      )}
      <td className="p-2 text-right font-semibold text-sm whitespace-nowrap">{fmt(total)}</td>
      <td className="p-2 text-center w-10">
        {isEditable && (
          <IconButton icon={Trash2} variant="danger" onClick={() => onRemove(index)} title="Eliminar línea" />
        )}
      </td>
    </tr>
  );
}

export default function LineasLibreTable({ lineas = [], modoIva, ivaGlobal, onUpdate, onRemove, onAdd, isEditable, submitted = false }) {
  return (
    <div className="bg-white rounded-xl border mb-4 shadow-sm">
      <div className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
        <h3 className="font-semibold text-gray-700">Ítems libres</h3>
        {isEditable && (
          <Button text="Agregar ítem" icon={Plus} variant="outline" onClick={onAdd} />
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-right">Cant.</th>
              <th className="p-2 text-right">Precio unit.</th>
              <th className="p-2 text-right">Descuento</th>
              {modoIva === "linea" && <th className="p-2 text-center">IVA %</th>}
              <th className="p-2 text-right">Total</th>
              <th className="p-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {lineas.map((linea, i) => (
              <LineaLibreRow
                key={linea.id}
                linea={linea}
                index={i}
                modoIva={modoIva}
                ivaGlobal={ivaGlobal}
                onUpdate={onUpdate}
                onRemove={onRemove}
                isEditable={isEditable}
                submitted={submitted}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
      />
    </div>
  );
}
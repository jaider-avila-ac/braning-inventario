import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export const SortIcon = ({ sort, colKey }) => {
  if (!sort || sort.key !== colKey) return <ChevronsUpDown className="w-3 h-3 opacity-50" />;
  return sort.dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
};
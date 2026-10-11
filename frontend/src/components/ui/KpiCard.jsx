import { Link } from "react-router-dom";

const cardColorStyles = {
  blue:    { bg: "bg-blue-600 hover:bg-blue-700",       sub: "text-blue-100" },
  green:   { bg: "bg-emerald-600 hover:bg-emerald-700", sub: "text-emerald-100" },
  red:     { bg: "bg-red-600 hover:bg-red-700",         sub: "text-red-100" },
  amber:   { bg: "bg-amber-500 hover:bg-amber-600",     sub: "text-amber-100" },
  purple:  { bg: "bg-purple-600 hover:bg-purple-700",   sub: "text-purple-100" },
  orange:  { bg: "bg-orange-500 hover:bg-orange-600",   sub: "text-orange-100" },
  slate:   { bg: "bg-slate-600 hover:bg-slate-700",     sub: "text-slate-100" },
  teal:    { bg: "bg-teal-600 hover:bg-teal-700",       sub: "text-teal-100" },
  indigo:  { bg: "bg-indigo-600 hover:bg-indigo-700",   sub: "text-indigo-100" },
};

const iconBadgeStyles = {
  blue:    "bg-blue-500 text-white",
  indigo:  "bg-indigo-500 text-white",
  teal:    "bg-teal-500 text-white",
  amber:   "bg-amber-500 text-white",
  emerald: "bg-emerald-500 text-white",
  red:     "bg-red-500 text-white",
  purple:  "bg-purple-500 text-white",
  green:   "bg-green-500 text-white",
  orange:  "bg-orange-500 text-white",
  gray:    "bg-gray-400 text-white",
};

export default function KpiCard({ title, value, subtitle, iconClass, color = "blue", iconColor, to, large = false, loading = false }) {
  const isWhite = color === "white";
  const iconSize = large ? "w-12 h-12 text-2xl" : "w-11 h-11 text-xl";
  const skeletonH = large ? "h-9" : "h-7";

  let card;

  if (isWhite) {
    const badgeStyle = iconBadgeStyles[iconColor] || "bg-blue-500 text-white";
    card = (
      <div className={`bg-white border border-gray-100 rounded-xl p-4 shadow-sm transition-all hover:shadow-md cursor-pointer ${large ? "py-5" : ""}`}>
        <div className="flex items-center gap-3">
          {iconClass && (
            <div className={`${iconSize} rounded-xl ${badgeStyle} flex items-center justify-center shrink-0`}>
              <i className={`${iconClass} text-white`}></i>
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</div>
            {loading
              ? <div className={`${skeletonH} w-28 bg-gray-200 rounded-lg animate-pulse mt-1`} />
              : <div className={`font-bold text-gray-800 leading-tight ${large ? "text-3xl" : "text-2xl"}`}>{value ?? "—"}</div>
            }
            {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
          </div>
        </div>
      </div>
    );
  } else {
    const styles = cardColorStyles[color] || cardColorStyles.blue;
    card = (
      <div className={`${styles.bg} rounded-xl p-4 transition-all cursor-pointer shadow-md ${large ? "py-5" : ""}`}>
        <div className="flex items-center gap-3">
          {iconClass && (
            <div className={`${iconSize} rounded-lg bg-white/20 flex items-center justify-center shrink-0`}>
              <i className={`${iconClass} text-white`}></i>
            </div>
          )}
          <div className={!iconClass ? "w-full" : ""}>
            <div className={`text-xs font-semibold ${styles.sub} uppercase tracking-wide`}>{title}</div>
            {loading
              ? <div className={`${skeletonH} w-28 bg-white/30 rounded-lg animate-pulse mt-1`} />
              : <div className={`font-bold leading-tight text-white ${large ? "text-3xl" : "text-2xl"}`}>{value ?? "—"}</div>
            }
            {subtitle && <div className={`text-xs ${styles.sub} mt-0.5`}>{subtitle}</div>}
          </div>
        </div>
      </div>
    );
  }

  return to ? <Link to={to} className="block no-underline">{card}</Link> : card;
}

export default function Card({ title, value, subtitle, color, icon, trend }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/50 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Bordure animée */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 blur-sm animate-pulse" />
      </div>

      <div className="relative p-6 space-y-3">
        {/* En-tête avec icône */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          {icon && <span className="text-2xl opacity-60">{icon}</span>}
        </div>

        {/* Valeur principale */}
        <div className="flex items-baseline space-x-2">
          <h3
            className={`text-5xl font-black ${color} transition-all duration-500 group-hover:scale-110`}
            style={{
              textShadow: "0 0 30px currentColor, 0 0 60px currentColor",
            }}
          >
            {value}
          </h3>
          {trend && (
            <span className="text-xs font-semibold text-slate-500 px-2 py-1 rounded-full bg-slate-800/50">
              {trend}
            </span>
          )}
        </div>

        {/* Sous-titre */}
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        )}

        {/* Barre de progression décorative */}
        <div className="h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${color.replace("text", "bg")} transition-all duration-1000 ease-out`}
            style={{
              width: `${Math.min((value / 20) * 100, 100)}%`,
              boxShadow: "0 0 10px currentColor",
            }}
          />
        </div>
      </div>
    </div>
  );
}

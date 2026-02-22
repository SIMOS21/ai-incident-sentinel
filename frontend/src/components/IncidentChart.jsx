import { useMemo } from "react";

export default function IncidentChart({ incidents, type }) {
  const chartData = useMemo(() => {
    if (type === "timeline") {
      // Grouper par jour
      const grouped = {};
      incidents.forEach((inc) => {
        const date = new Date(inc.timestamp).toLocaleDateString("fr-FR");
        grouped[date] = (grouped[date] || 0) + 1;
      });
      return Object.entries(grouped)
        .slice(-7)
        .map(([date, count]) => ({ date, count }));
    } else if (type === "severity") {
      // Compter par sévérité
      const counts = {
        high: incidents.filter((x) => x.severity === "high").length,
        medium: incidents.filter((x) => x.severity === "medium").length,
        low: incidents.filter((x) => x.severity === "low").length,
      };
      return [
        { name: "Haute", count: counts.high, color: "#ef4444" },
        { name: "Moyenne", count: counts.medium, color: "#f59e0b" },
        { name: "Faible", count: counts.low, color: "#10b981" },
      ];
    }
    return [];
  }, [incidents, type]);

  if (type === "timeline") {
    const maxCount = Math.max(...chartData.map((d) => d.count), 1);

    return (
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-200 mb-1">
            📈 Évolution temporelle
          </h3>
          <p className="text-sm text-slate-500">
            Incidents des 7 derniers jours
          </p>
        </div>

        <div className="space-y-4">
          {chartData.map((item, idx) => (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">
                  {item.date}
                </span>
                <span className="text-sm font-bold text-cyan-400">
                  {item.count}
                </span>
              </div>
              <div className="h-3 bg-slate-950/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000 ease-out group-hover:from-cyan-400 group-hover:to-blue-500"
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                    boxShadow: "0 0 20px rgba(34, 211, 238, 0.5)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "severity") {
    const total = chartData.reduce((sum, item) => sum + item.count, 0);

    return (
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 rounded-2xl border border-slate-700/50 p-6 backdrop-blur-sm shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-200 mb-1">
            🎯 Répartition par sévérité
          </h3>
          <p className="text-sm text-slate-500">Distribution des incidents</p>
        </div>

        <div className="space-y-6">
          {/* Graphique en barres horizontales */}
          <div className="space-y-4">
            {chartData.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: `0 0 10px ${item.color}`,
                      }}
                    />
                    <span className="text-sm font-medium text-slate-300">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-200">
                      {item.count}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({total > 0 ? ((item.count / total) * 100).toFixed(0) : 0}
                      %)
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-slate-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${total > 0 ? (item.count / total) * 100 : 0}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 0 15px ${item.color}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Graphique en donut */}
          <div className="flex items-center justify-center pt-4">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {chartData.map((item, idx) => {
                  const percentage = total > 0 ? (item.count / total) * 100 : 0;
                  const previousPercentages = chartData
                    .slice(0, idx)
                    .reduce(
                      (sum, i) => sum + (total > 0 ? (i.count / total) * 100 : 0),
                      0
                    );
                  const circumference = 2 * Math.PI * 40;
                  const strokeDasharray = `${
                    (percentage / 100) * circumference
                  } ${circumference}`;
                  const strokeDashoffset =
                    -(previousPercentages / 100) * circumference;

                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="12"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                      style={{
                        filter: `drop-shadow(0 0 8px ${item.color})`,
                      }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-black text-slate-200">
                    {total}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Total
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

import { useState, useMemo } from "react";
import Loader from "../components/Loader";
import { useLiveIncidents } from "../hooks/useLiveIncidents";

export default function Analytics() {
  // Utiliser le hook LIVE pour avoir les données synchronisées
  const {
    incidents,
    loading,
    error,
  } = useLiveIncidents({
    refreshInterval: 30000, // 30 secondes (moins fréquent que Dashboard)
    autoRefresh: true,
  });

  const [timeRange, setTimeRange] = useState("month"); // week, month, quarter, all
  const [compareMode, setCompareMode] = useState(false);

  // Filtrer par période
  const filteredIncidents = useMemo(() => {
    if (timeRange === "all") return incidents;
    const now = new Date();
    const daysAgo = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;
    const cutoff = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    return incidents.filter((inc) => new Date(inc.timestamp) >= cutoff);
  }, [incidents, timeRange]);

  // Période précédente pour comparaison
  const previousPeriodIncidents = useMemo(() => {
    if (!compareMode || timeRange === "all") return [];
    const now = new Date();
    const daysAgo = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 90;
    const periodStart = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(now - 2 * daysAgo * 24 * 60 * 60 * 1000);
    return incidents.filter((inc) => {
      const incDate = new Date(inc.timestamp);
      return incDate >= periodEnd && incDate < periodStart;
    });
  }, [incidents, timeRange, compareMode]);

  // Statistiques
  const stats = useMemo(() => {
    const total = filteredIncidents.length;
    const high = filteredIncidents.filter((x) => x.severity === "high").length;
    const medium = filteredIncidents.filter((x) => x.severity === "medium").length;
    const low = filteredIncidents.filter((x) => x.severity === "low").length;
    const anomalies = filteredIncidents.filter((x) => x.is_anomaly).length;
    const avgScore =
      total > 0
        ? filteredIncidents.reduce((sum, inc) => sum + (inc.score || 0), 0) / total
        : 0;

    // Statistiques de la période précédente
    const prevTotal = previousPeriodIncidents.length;
    const prevHigh = previousPeriodIncidents.filter((x) => x.severity === "high").length;
    const prevAnomalies = previousPeriodIncidents.filter((x) => x.is_anomaly).length;

    // Calcul des variations
    const totalChange = prevTotal > 0 ? (((total - prevTotal) / prevTotal) * 100).toFixed(1) : 0;
    const highChange = prevHigh > 0 ? (((high - prevHigh) / prevHigh) * 100).toFixed(1) : 0;
    const anomalyChange =
      prevAnomalies > 0 ? (((anomalies - prevAnomalies) / prevAnomalies) * 100).toFixed(1) : 0;

    // Par source
    const bySource = {};
    filteredIncidents.forEach((inc) => {
      bySource[inc.source] = (bySource[inc.source] || 0) + 1;
    });

    // Par type
    const byType = {};
    filteredIncidents.forEach((inc) => {
      byType[inc.type] = (byType[inc.type] || 0) + 1;
    });

    // Évolution temporelle détaillée
    const byDay = {};
    filteredIncidents.forEach((inc) => {
      const date = new Date(inc.timestamp).toLocaleDateString("fr-FR");
      if (!byDay[date]) {
        byDay[date] = { total: 0, high: 0, medium: 0, low: 0 };
      }
      byDay[date].total++;
      byDay[date][inc.severity]++;
    });

    // Évolution horaire (pour analyse de patterns)
    const byHour = Array(24).fill(0);
    filteredIncidents.forEach((inc) => {
      const hour = new Date(inc.timestamp).getHours();
      byHour[hour]++;
    });

    // Par jour de la semaine
    const byWeekday = Array(7).fill(0);
    filteredIncidents.forEach((inc) => {
      const day = new Date(inc.timestamp).getDay();
      byWeekday[day]++;
    });

    // Top sources critiques avec détails
    const criticalSources = Object.entries(bySource)
      .map(([source, count]) => {
        const sourceIncidents = filteredIncidents.filter((inc) => inc.source === source);
        const highCount = sourceIncidents.filter((inc) => inc.severity === "high").length;
        const avgSourceScore =
          sourceIncidents.reduce((sum, inc) => sum + (inc.score || 0), 0) / count;
        return { source, total: count, highCount, avgScore: avgSourceScore };
      })
      .sort((a, b) => b.highCount - a.highCount)
      .slice(0, 10);

    // Matrice de corrélation source/type
    const sourceTypeMatrix = {};
    filteredIncidents.forEach((inc) => {
      const key = `${inc.source}|||${inc.type}`;
      sourceTypeMatrix[key] = (sourceTypeMatrix[key] || 0) + 1;
    });

    return {
      total,
      high,
      medium,
      low,
      anomalies,
      avgScore,
      totalChange,
      highChange,
      anomalyChange,
      bySource,
      byType,
      byDay,
      byHour,
      byWeekday,
      criticalSources,
      sourceTypeMatrix,
    };
  }, [filteredIncidents, previousPeriodIncidents, compareMode]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-400 text-lg p-8">
        <p className="mb-4">❌ Impossible de charger les données.</p>
      </div>
    );
  }

  const weekdays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-gray-50 light:via-white light:to-gray-50 p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
            Analytiques Avancées
          </h1>
          <p className="text-slate-400 dark:text-slate-400 light:text-gray-600">
            Rapports détaillés et analyse de tendances
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Toggle comparaison */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${
              compareMode
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                : "bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-200 text-slate-400 dark:text-slate-400 light:text-gray-700"
            }`}
          >
            📊 Comparaison
          </button>

          {/* Sélecteur de période */}
          <div className="flex space-x-2 bg-slate-900/50 dark:bg-slate-900/50 light:bg-white rounded-xl p-1 border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200">
            {[
              { value: "week", label: "7j" },
              { value: "month", label: "30j" },
              { value: "quarter", label: "90j" },
              { value: "all", label: "Tout" },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  timeRange === range.value
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                    : "text-slate-400 dark:text-slate-400 light:text-gray-600 hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-gray-900"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI avancés avec comparaison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Incidents"
          value={stats.total}
          icon="📊"
          color="cyan"
          change={compareMode ? stats.totalChange : null}
        />
        <StatCard
          title="Incidents Critiques"
          value={stats.high}
          icon="🔴"
          color="red"
          percentage={stats.total > 0 ? ((stats.high / stats.total) * 100).toFixed(1) : 0}
          change={compareMode ? stats.highChange : null}
        />
        <StatCard
          title="Anomalies Détectées"
          value={stats.anomalies}
          icon="⚡"
          color="purple"
          percentage={stats.total > 0 ? ((stats.anomalies / stats.total) * 100).toFixed(1) : 0}
          change={compareMode ? stats.anomalyChange : null}
        />
        <StatCard
          title="Score Moyen"
          value={stats.avgScore.toFixed(3)}
          icon="📈"
          color="blue"
        />
      </div>

      {/* Ligne 1: Évolution + Heatmap horaire */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Évolution temporelle détaillée */}
        <div className="lg:col-span-2">
          <ChartCard title="📈 Évolution Temporelle Détaillée">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {Object.entries(stats.byDay)
                .slice(-20)
                .map(([date, counts]) => (
                  <div key={date}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600 font-medium">
                        {date}
                      </span>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-red-400">{counts.high} 🔴</span>
                        <span className="text-xs text-yellow-400">{counts.medium} 🟡</span>
                        <span className="text-xs text-green-400">{counts.low} 🟢</span>
                        <span className="text-sm font-bold text-slate-300 dark:text-slate-300 light:text-gray-900 ml-2">
                          {counts.total}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1 h-3 rounded-full overflow-hidden bg-slate-800 dark:bg-slate-800 light:bg-gray-200">
                      {counts.high > 0 && (
                        <div
                          className="bg-red-500 transition-all duration-500 hover:bg-red-400"
                          style={{ width: `${(counts.high / counts.total) * 100}%` }}
                          title={`${counts.high} critiques`}
                        />
                      )}
                      {counts.medium > 0 && (
                        <div
                          className="bg-yellow-500 transition-all duration-500 hover:bg-yellow-400"
                          style={{ width: `${(counts.medium / counts.total) * 100}%` }}
                          title={`${counts.medium} moyens`}
                        />
                      )}
                      {counts.low > 0 && (
                        <div
                          className="bg-green-500 transition-all duration-500 hover:bg-green-400"
                          style={{ width: `${(counts.low / counts.total) * 100}%` }}
                          title={`${counts.low} faibles`}
                        />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </ChartCard>
        </div>

        {/* Pattern horaire - Heatmap */}
        <ChartCard title="🕐 Distribution Horaire">
          <div className="space-y-2">
            {stats.byHour.map((count, hour) => {
              const maxCount = Math.max(...stats.byHour);
              const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={hour} className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600 w-12">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                  <div className="flex-1 h-6 bg-slate-800 dark:bg-slate-800 light:bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-500"
                      style={{ width: `${intensity}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-gray-700 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Ligne 2: Jour de la semaine + Répartition sévérité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Par jour de la semaine */}
        <ChartCard title="📅 Distribution par Jour de la Semaine">
          <div className="space-y-3">
            {stats.byWeekday.map((count, idx) => {
              const maxCount = Math.max(...stats.byWeekday);
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-gray-900">
                      {weekdays[idx]}
                    </span>
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-400 light:text-gray-700">
                      {count}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-800 dark:bg-slate-800 light:bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Répartition par sévérité */}
        <ChartCard title="🎯 Répartition par Sévérité">
          <div className="space-y-4">
            <SeverityBar label="Haute" value={stats.high} total={stats.total} color="red" />
            <SeverityBar
              label="Moyenne"
              value={stats.medium}
              total={stats.total}
              color="yellow"
            />
            <SeverityBar label="Faible" value={stats.low} total={stats.total} color="green" />
          </div>
          <div className="mt-6 flex justify-center">
            <DonutChart high={stats.high} medium={stats.medium} low={stats.low} />
          </div>
        </ChartCard>
      </div>

      {/* Ligne 3: Top sources + Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top sources critiques - ÉTENDU */}
        <ChartCard title="⚠️ Top 10 Sources Critiques">
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {stats.criticalSources.map((source, idx) => (
              <div key={source.source} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-lg font-bold text-slate-500 dark:text-slate-500 light:text-gray-400">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-mono text-slate-300 dark:text-slate-300 light:text-gray-900 truncate">
                      {source.source}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-xs text-red-400 font-semibold">
                      {source.highCount} 🔴
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600">
                      {source.total} total
                    </span>
                    <span className="text-xs text-cyan-400 font-mono">
                      {source.avgScore.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-800 dark:bg-slate-800 light:bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(source.highCount / source.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Par type - COMPLET */}
        <ChartCard title="📁 Distribution par Type">
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {Object.entries(stats.byType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={type} className="flex items-center justify-between group">
                    <span className="text-sm font-mono text-slate-300 dark:text-slate-300 light:text-gray-900 truncate flex-1">
                      {type}
                    </span>
                    <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                      <div className="w-32 h-2 bg-slate-800 dark:bg-slate-800 light:bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600 w-12 text-right">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm font-bold text-cyan-400 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </ChartCard>
      </div>

      {/* Insights et recommandations */}
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 dark:from-slate-900/90 dark:to-slate-800/50 light:from-white light:to-gray-50 rounded-2xl border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-200 dark:text-slate-200 light:text-gray-900 mb-4 flex items-center space-x-2">
          <span>💡</span>
          <span>Insights & Recommandations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="text-blue-400 font-semibold mb-2">📊 Tendance Générale</div>
            <p className="text-sm text-slate-300 dark:text-slate-300 light:text-gray-700">
              {compareMode && stats.totalChange > 0
                ? `Augmentation de ${stats.totalChange}% par rapport à la période précédente`
                : compareMode && stats.totalChange < 0
                ? `Diminution de ${Math.abs(stats.totalChange)}% - Amélioration notable`
                : `${stats.total} incidents détectés sur la période`}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="text-red-400 font-semibold mb-2">🔴 Priorités</div>
            <p className="text-sm text-slate-300 dark:text-slate-300 light:text-gray-700">
              {stats.criticalSources[0]
                ? `Focus sur "${stats.criticalSources[0].source}" avec ${stats.criticalSources[0].highCount} incidents critiques`
                : "Aucune source critique identifiée"}
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="text-purple-400 font-semibold mb-2">⚡ Anomalies</div>
            <p className="text-sm text-slate-300 dark:text-slate-300 light:text-gray-700">
              {stats.anomalies > 0
                ? `${stats.anomalies} comportements anormaux détectés (${((stats.anomalies / stats.total) * 100).toFixed(1)}%)`
                : "Aucune anomalie détectée"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composants helper (identiques à la version précédente mais avec ajout de la variation)
function StatCard({ title, value, icon, color, percentage, change }) {
  const colorClasses = {
    cyan: "from-cyan-600 to-blue-600",
    red: "from-red-600 to-orange-600",
    purple: "from-purple-600 to-pink-600",
    blue: "from-blue-600 to-indigo-600",
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 dark:from-slate-900/90 dark:to-slate-800/50 light:from-white light:to-gray-50 rounded-2xl border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600 font-medium">
          {title}
        </span>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className="text-4xl font-black text-slate-200 dark:text-slate-200 light:text-gray-900 mb-2">
        {value}
      </div>
      <div className="flex items-center space-x-2">
        {percentage && (
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${colorClasses[color]} text-white`}
          >
            {percentage}% du total
          </div>
        )}
        {change && (
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              change > 0
                ? "bg-red-500/20 text-red-400"
                : change < 0
                ? "bg-green-500/20 text-green-400"
                : "bg-slate-500/20 text-slate-400"
            }`}
          >
            {change > 0 ? "↑" : change < 0 ? "↓" : "="} {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 dark:from-slate-900/90 dark:to-slate-800/50 light:from-white light:to-gray-50 rounded-2xl border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-slate-200 dark:text-slate-200 light:text-gray-900 mb-6">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SeverityBar({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-gray-900">
          {label}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-slate-200 dark:text-slate-200 light:text-gray-900">
            {value}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600">
            ({percentage.toFixed(1)}%)
          </span>
        </div>
      </div>
      <div className="h-3 bg-slate-800 dark:bg-slate-800 light:bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function DonutChart({ high, medium, low }) {
  const total = high + medium + low;
  if (total === 0)
    return (
      <div className="text-slate-500 dark:text-slate-500 light:text-gray-500 text-sm">
        Aucune donnée
      </div>
    );

  const highPerc = (high / total) * 100;
  const mediumPerc = (medium / total) * 100;

  return (
    <div className="relative w-40 h-40">
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#ef4444"
          strokeWidth="12"
          strokeDasharray={`${(highPerc / 100) * 251.2} 251.2`}
          strokeDashoffset="0"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="12"
          strokeDasharray={`${(mediumPerc / 100) * 251.2} 251.2`}
          strokeDashoffset={`-${(highPerc / 100) * 251.2}`}
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeDasharray={`${((100 - highPerc - mediumPerc) / 100) * 251.2} 251.2`}
          strokeDashoffset={`-${((highPerc + mediumPerc) / 100) * 251.2}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-black text-slate-200 dark:text-slate-200 light:text-gray-900">
            {total}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600">
            Total
          </div>
        </div>
      </div>
    </div>
  );
}

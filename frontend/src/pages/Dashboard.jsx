import { useState, useEffect } from "react";
import Card from "../components/Card";
import Loader from "../components/Loader";
import IncidentTable from "../components/IncidentTable";
import FilterBar from "../components/FilterBar";
import ExportButton from "../components/ExportButton";
import NotificationSystem from "../components/NotificationSystem";
import LiveIndicator from "../components/LiveIndicator";
import { useLiveIncidents } from "../hooks/useLiveIncidents";
import PDFExportButton from "../components/PDFExportButton";
export default function Dashboard() {
  // Utiliser le hook pour les données en temps réel
  const {
    incidents,
    loading,
    error,
    lastUpdate,
    isLive,
    newIncidentsCount,
    refresh,
    toggleLive,
  } = useLiveIncidents({
    refreshInterval: 5000, // Mise à jour toutes les 5 secondes
    autoRefresh: true,
  });

  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [filters, setFilters] = useState({
    severity: "all",
    search: "",
    dateRange: "all"
  });

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...incidents];

    if (filters.severity !== "all") {
      filtered = filtered.filter((inc) => inc.severity === filters.severity);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (inc) =>
          inc.message?.toLowerCase().includes(filters.search.toLowerCase()) ||
          inc.source?.toLowerCase().includes(filters.search.toLowerCase()) ||
          inc.type?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.dateRange !== "all") {
      const now = new Date();
      const ranges = {
        today: 1,
        week: 7,
        month: 30,
      };
      const daysAgo = ranges[filters.dateRange];
      if (daysAgo) {
        const cutoffDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (inc) => new Date(inc.timestamp) >= cutoffDate
        );
      }
    }

    setFilteredIncidents(filtered);
  }, [filters, incidents]);

  if (loading && incidents.length === 0)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );

  if (error && incidents.length === 0)
    return (
      <div className="text-center mt-20 text-red-400 text-lg p-8">
        <p className="mb-4">❌ Impossible de charger les données.</p>
        <p className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600">Erreur: {error}</p>
        <p className="mt-4 text-slate-300 dark:text-slate-300 light:text-gray-700">
          Vérifie que{" "}
          <span className="font-bold text-indigo-400">le backend</span> tourne bien
        </p>
        <button
          onClick={refresh}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          🔄 Réessayer
        </button>
      </div>
    );

  const stats = {
    total: filteredIncidents.length,
    high: filteredIncidents.filter((x) => x.severity === "high").length,
    medium: filteredIncidents.filter((x) => x.severity === "medium").length,
    low: filteredIncidents.filter((x) => x.severity === "low").length,
    anomalies: filteredIncidents.filter((x) => x.is_anomaly).length,
  };

  // Incidents récents (dernières 24h)
  const last24h = incidents.filter((inc) => {
    const incDate = new Date(inc.timestamp);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return incDate >= dayAgo;
  }).length;

  // Tendance (comparaison avec hier)
  const yesterday = incidents.filter((inc) => {
    const incDate = new Date(inc.timestamp);
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return incDate >= twoDaysAgo && incDate < oneDayAgo;
  }).length;

  const trend = yesterday > 0 ? (((last24h - yesterday) / yesterday) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-gray-50 light:via-white light:to-gray-50">
      {/* Système de notifications */}
      <NotificationSystem incidents={incidents} />

      {/* En-tête avec LIVE indicator */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 border-b border-slate-800/50 dark:border-slate-800/50 light:border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                Command Center
              </h1>
              <p className="text-slate-400 dark:text-slate-400 light:text-gray-600 text-sm">
                Surveillance en temps réel • {last24h} incidents détectés aujourd'hui
              </p>
            </div>
            
            {/* Contrôles à droite */}
            <div className="flex items-center space-x-4">
              <LiveIndicator
                isLive={isLive}
                lastUpdate={lastUpdate}
                onToggle={toggleLive}
                newCount={newIncidentsCount}
              />
              <button
                onClick={refresh}
                disabled={loading}
                className="px-4 py-2 bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-200 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-300 text-slate-300 dark:text-slate-300 light:text-gray-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Rafraîchir maintenant"
              >
                <svg
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <ExportButton incidents={filteredIncidents} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Barre de filtres */}
        <FilterBar filters={filters} setFilters={setFilters} />

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card
            title="Total"
            value={stats.total}
            subtitle={`sur ${incidents.length}`}
            color="text-cyan-400"
            icon="📊"
          />
          <Card
            title="Critiques"
            value={stats.high}
            subtitle="haute sévérité"
            color="text-red-400"
            icon="🔴"
            trend={stats.high > 5 ? "⚠️ Alerte" : "✓ Normal"}
          />
          <Card
            title="Moyens"
            value={stats.medium}
            subtitle="sévérité moyenne"
            color="text-yellow-400"
            icon="🟡"
          />
          <Card
            title="Faibles"
            value={stats.low}
            subtitle="faible sévérité"
            color="text-green-400"
            icon="🟢"
          />
          <Card
            title="24h"
            value={last24h}
            subtitle="dernières 24 heures"
            color="text-purple-400"
            icon="⏰"
            trend={trend > 0 ? `+${trend}%` : `${trend}%`}
          />
        </div>

        {/* Alerte critique avec animation */}
        {stats.high > 0 && (
          <div className="bg-gradient-to-r from-red-900/20 via-red-800/20 to-red-900/20 border-2 border-red-500/50 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-5xl animate-bounce">🚨</div>
                <div>
                  <h3 className="text-2xl font-bold text-red-400 mb-1">
                    Attention : {stats.high} incidents critiques !
                  </h3>
                  <p className="text-slate-300 dark:text-slate-300 light:text-gray-700">
                    Action immédiate requise pour les incidents de haute sévérité
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilters({ ...filters, severity: "high" })}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/50"
              >
                Voir les critiques →
              </button>
            </div>
          </div>
        )}

        {/* Activité récente */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 dark:from-slate-900/90 dark:to-slate-800/50 light:from-white light:to-gray-50 rounded-2xl border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-200 dark:text-slate-200 light:text-gray-900">
              ⚡ Activité Récente
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              {isLive && (
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Mise à jour automatique</span>
                </div>
              )}
            </div>
          </div>

          {/* Mini statistiques rapides */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/30 dark:bg-slate-800/30 light:bg-gray-100 rounded-xl p-4">
              <div className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600 mb-1">
                Dernière heure
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {incidents.filter((inc) => {
                  const incDate = new Date(inc.timestamp);
                  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
                  return incDate >= hourAgo;
                }).length}
              </div>
            </div>
            <div className="bg-slate-800/30 dark:bg-slate-800/30 light:bg-gray-100 rounded-xl p-4">
              <div className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600 mb-1">
                Aujourd'hui
              </div>
              <div className="text-2xl font-bold text-blue-400">{last24h}</div>
            </div>
            <div className="bg-slate-800/30 dark:bg-slate-800/30 light:bg-gray-100 rounded-xl p-4">
              <div className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600 mb-1">
                Cette semaine
              </div>
              <div className="text-2xl font-bold text-indigo-400">
                {incidents.filter((inc) => {
                  const incDate = new Date(inc.timestamp);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return incDate >= weekAgo;
                }).length}
              </div>
            </div>
          </div>

          {/* Sources les plus actives aujourd'hui */}
          <div className="border-t border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 pt-6">
            <h4 className="text-sm font-semibold text-slate-400 dark:text-slate-400 light:text-gray-600 uppercase tracking-wider mb-4">
              Sources actives aujourd'hui
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {(() => {
                const today = incidents.filter((inc) => {
                  const incDate = new Date(inc.timestamp);
                  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                  return incDate >= dayAgo;
                });
                const sources = {};
                today.forEach((inc) => {
                  sources[inc.source] = (sources[inc.source] || 0) + 1;
                });
                return Object.entries(sources)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 4)
                  .map(([source, count]) => (
                    <div
                      key={source}
                      className="flex items-center justify-between bg-slate-800/20 dark:bg-slate-800/20 light:bg-gray-50 rounded-lg p-3 hover:bg-slate-700/30 dark:hover:bg-slate-700/30 light:hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-mono text-slate-300 dark:text-slate-300 light:text-gray-900 truncate">
                        {source}
                      </span>
                      <span className="text-sm font-bold text-cyan-400 ml-2">
                        {count}
                      </span>
                    </div>
                  ));
              })()}
            </div>
          </div>
        </div>

        {/* Tableau des incidents récents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-200 dark:text-slate-200 light:text-gray-900">
              📋 Incidents Récents
            </h2>
            <a
              href="/incidents"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center space-x-2 transition-colors"
            >
              <span>Voir tous les incidents</span>
              <span>→</span>
            </a>
          </div>
          <IncidentTable incidents={filteredIncidents.slice(0, 20)} />
        </div>
      </div>
    </div>
  );
}

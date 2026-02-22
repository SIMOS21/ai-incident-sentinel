import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import LiveIndicator from "../components/LiveIndicator";
import { useLiveIncidents } from "../hooks/useLiveIncidents";

export default function Incidents() {
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
    refreshInterval: 10000, // 10 secondes (moins fréquent que le dashboard)
    autoRefresh: true,
  });

  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filters, setFilters] = useState({
    severity: "all",
    search: "",
    type: "all",
    sortBy: "timestamp",
    sortOrder: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...incidents];

    if (filters.severity !== "all") {
      filtered = filtered.filter((inc) => inc.severity === filters.severity);
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((inc) => inc.type === filters.type);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (inc) =>
          inc.message?.toLowerCase().includes(filters.search.toLowerCase()) ||
          inc.source?.toLowerCase().includes(filters.search.toLowerCase()) ||
          inc.id?.toString().includes(filters.search)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      const modifier = filters.sortOrder === "asc" ? 1 : -1;
      if (filters.sortBy === "timestamp") {
        return modifier * (new Date(a.timestamp) - new Date(b.timestamp));
      }
      if (filters.sortBy === "severity") {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return (
          modifier *
          ((severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0))
        );
      }
      if (filters.sortBy === "score") {
        return modifier * ((a.score || 0) - (b.score || 0));
      }
      return 0;
    });

    setFilteredIncidents(filtered);
    setCurrentPage(1);
  }, [filters, incidents]);

  // Pagination
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIncidents = filteredIncidents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/50";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const uniqueTypes = [...new Set(incidents.map((inc) => inc.type))];

  if (loading && incidents.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error && incidents.length === 0) {
    return (
      <div className="text-center mt-20 text-red-400 text-lg p-8">
        <p className="mb-4">❌ Impossible de charger les données.</p>
        <p className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600">
          Erreur: {error}
        </p>
        <button
          onClick={refresh}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-gray-50 light:via-white light:to-gray-50 p-8">
      {/* En-tête avec LIVE */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
            Gestion des Incidents
          </h1>
          <p className="text-slate-400 dark:text-slate-400 light:text-gray-600">
            {filteredIncidents.length} incident{filteredIncidents.length > 1 ? "s" : ""}{" "}
            {filters.search || filters.severity !== "all" || filters.type !== "all"
              ? "trouvé" + (filteredIncidents.length > 1 ? "s" : "")
              : "au total"}
          </p>
        </div>

        {/* Contrôles LIVE */}
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
            className="px-4 py-2 bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-200 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-300 text-slate-300 dark:text-slate-300 light:text-gray-700 rounded-xl transition-all disabled:opacity-50"
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
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 dark:from-slate-900/90 dark:via-slate-800/90 dark:to-slate-900/90 light:from-white light:via-gray-50 light:to-white backdrop-blur-xl rounded-2xl border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 p-6 shadow-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-700 uppercase tracking-wider mb-2 block">
              🔍 Recherche
            </label>
            <input
              type="text"
              placeholder="ID, message, source..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Sévérité */}
          <div>
            <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-700 uppercase tracking-wider mb-2 block">
              🎯 Sévérité
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 cursor-pointer"
            >
              <option value="all">Toutes</option>
              <option value="high">🔴 Haute</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="low">🟢 Faible</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-700 uppercase tracking-wider mb-2 block">
              📁 Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 cursor-pointer"
            >
              <option value="all">Tous les types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Tri */}
          <div>
            <label className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-700 uppercase tracking-wider mb-2 block">
              ⚡ Trier par
            </label>
            <div className="flex space-x-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="flex-1 px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 cursor-pointer text-sm"
              >
                <option value="timestamp">Date</option>
                <option value="severity">Sévérité</option>
                <option value="score">Score</option>
              </select>
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                  })
                }
                className="px-4 py-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-200 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-300 rounded-xl transition-colors border border-slate-700 dark:border-slate-700 light:border-gray-300"
              >
                {filters.sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Réinitialiser */}
        {(filters.search || filters.severity !== "all" || filters.type !== "all") && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 dark:border-slate-700/50 light:border-gray-200">
            <button
              onClick={() =>
                setFilters({
                  severity: "all",
                  search: "",
                  type: "all",
                  sortBy: "timestamp",
                  sortOrder: "desc",
                })
              }
              className="text-sm px-4 py-2 bg-slate-700/50 dark:bg-slate-700/50 light:bg-gray-200 hover:bg-slate-600/50 dark:hover:bg-slate-600/50 light:hover:bg-gray-300 rounded-full transition-colors text-slate-300 dark:text-slate-300 light:text-gray-700"
            >
              ✕ Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste des incidents */}
      <div className="space-y-4">
        {paginatedIncidents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-slate-400 dark:text-slate-400 light:text-gray-600">
              Aucun incident trouvé
            </p>
          </div>
        ) : (
          paginatedIncidents.map((incident) => (
            <div
              key={incident.id}
              onClick={() => setSelectedIncident(incident)}
              className="group bg-gradient-to-r from-slate-900/90 to-slate-800/50 dark:from-slate-900/90 dark:to-slate-800/50 light:from-white light:to-gray-50 backdrop-blur-sm rounded-xl border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 p-6 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{getSeverityIcon(incident.severity)}</span>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-500 light:text-gray-500">
                        #{incident.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-100 rounded-full text-xs font-mono text-slate-400 dark:text-slate-400 light:text-gray-600">
                        {incident.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 dark:text-slate-200 light:text-gray-900 mb-1">
                      {incident.message}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-500 light:text-gray-600">
                      <span className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{incident.source}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>🕐</span>
                        <span>
                          {new Date(incident.timestamp).toLocaleString("fr-FR")}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {incident.is_anomaly && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold border border-purple-500/50">
                      ⚡ Anomalie
                    </span>
                  )}
                  <div className="text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-500 mb-1">
                      Score
                    </div>
                    <div className="text-lg font-bold text-cyan-400">
                      {incident.score?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 light:text-gray-500">
                <span>Cliquez pour voir les détails</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between bg-slate-900/50 dark:bg-slate-900/50 light:bg-white backdrop-blur-sm rounded-xl border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 p-4">
          <div className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600">
            Page {currentPage} sur {totalPages} ({filteredIncidents.length} incidents)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-100 text-slate-300 dark:text-slate-300 light:text-gray-700 rounded-lg hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Précédent
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-100 text-slate-300 dark:text-slate-300 light:text-gray-700 rounded-lg hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Modal de détails (identique à la version précédente) */}
      {selectedIncident && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIncident(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800 light:from-white light:to-gray-50 rounded-2xl border border-slate-700 dark:border-slate-700 light:border-gray-300 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-5xl">{getSeverityIcon(selectedIncident.severity)}</span>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-mono text-slate-500 dark:text-slate-500 light:text-gray-500">
                      #{selectedIncident.id}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                        selectedIncident.severity
                      )}`}
                    >
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-200 dark:text-slate-200 light:text-gray-900">
                    Détails de l'incident
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-200 dark:text-slate-400 dark:hover:text-slate-200 light:text-gray-500 light:hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-400 light:text-gray-600 uppercase tracking-wider mb-2">
                  Message
                </h3>
                <p className="text-slate-200 dark:text-slate-200 light:text-gray-900">
                  {selectedIncident.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-400 light:text-gray-600 uppercase tracking-wider mb-2">
                    Source
                  </h3>
                  <p className="text-slate-300 dark:text-slate-300 light:text-gray-800 font-mono">
                    {selectedIncident.source}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-400 light:text-gray-600 uppercase tracking-wider mb-2">
                    Type
                  </h3>
                  <p className="text-slate-300 dark:text-slate-300 light:text-gray-800 font-mono">
                    {selectedIncident.type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-400 light:text-gray-600 uppercase tracking-wider mb-2">
                    Date & Heure
                  </h3>
                  <p className="text-slate-300 dark:text-slate-300 light:text-gray-800">
                    {new Date(selectedIncident.timestamp).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-400 light:text-gray-600 uppercase tracking-wider mb-2">
                    Score d'anomalie
                  </h3>
                  <p className="text-2xl font-bold text-cyan-400">
                    {selectedIncident.score?.toFixed(4)}
                  </p>
                </div>
              </div>

              {selectedIncident.values && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-400 light:text-gray-600 uppercase tracking-wider mb-2">
                    Valeurs
                  </h3>
                  <div className="bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 rounded-xl p-4 font-mono text-sm">
                    <pre className="text-slate-300 dark:text-slate-300 light:text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(selectedIncident.values, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedIncident.is_anomaly && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 text-purple-400">
                    <span className="text-xl">⚡</span>
                    <span className="font-semibold">Anomalie détectée</span>
                  </div>
                  <p className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600 mt-2">
                    Ce comportement a été identifié comme anormal par le système de détection.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

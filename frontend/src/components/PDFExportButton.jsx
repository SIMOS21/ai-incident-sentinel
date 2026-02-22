import { useState } from "react";

export default function PDFExportButton({ variant = "dashboard" }) {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("day");
  const [showMenu, setShowMenu] = useState(false);
  const [customDates, setCustomDates] = useState({
    start: "",
    end: "",
  });
  const [showCustom, setShowCustom] = useState(false);

  const handleExport = async (selectedPeriod) => {
    setLoading(true);
    setShowMenu(false);

    try {
      let url = `http://localhost:8000/v1/reports/generate?period=${selectedPeriod}`;

      // Si période personnalisée
      if (selectedPeriod === "custom" && customDates.start && customDates.end) {
        url = `http://localhost:8000/v1/reports/generate?start_date=${customDates.start}&end_date=${customDates.end}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du rapport");
      }

      // Télécharger le PDF
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `rapport_incidents_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Notification de succès
      alert("✅ Rapport PDF généré avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ Erreur lors de la génération du rapport PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Génération...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span>Rapport PDF</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                showMenu ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>

      {/* Menu déroulant */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-800 dark:bg-slate-800 light:bg-white rounded-xl shadow-2xl border border-slate-700 dark:border-slate-700 light:border-gray-200 z-50 overflow-hidden">
          <div className="p-2">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-600 uppercase tracking-wider px-3 py-2">
              Sélectionner la période
            </div>

            {/* Options prédéfinies */}
            <button
              onClick={() => handleExport("day")}
              className="w-full text-left px-4 py-3 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-200 dark:text-slate-200 light:text-gray-900">
                    📅 Aujourd'hui
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600">
                    Rapport du jour
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            <button
              onClick={() => handleExport("week")}
              className="w-full text-left px-4 py-3 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-200 dark:text-slate-200 light:text-gray-900">
                    📊 Cette semaine
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600">
                    7 derniers jours
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            <button
              onClick={() => handleExport("month")}
              className="w-full text-left px-4 py-3 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-200 dark:text-slate-200 light:text-gray-900">
                    📈 Ce mois
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600">
                    30 derniers jours
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            <button
              onClick={() => handleExport("all")}
              className="w-full text-left px-4 py-3 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-200 dark:text-slate-200 light:text-gray-900">
                    🗂️ Tout l'historique
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600">
                    Rapport complet
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            {/* Période personnalisée */}
            <div className="border-t border-slate-700 dark:border-slate-700 light:border-gray-200 mt-2 pt-2">
              <button
                onClick={() => setShowCustom(!showCustom)}
                className="w-full text-left px-4 py-3 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-slate-200 dark:text-slate-200 light:text-gray-900">
                  🎯 Période personnalisée
                </div>
              </button>

              {showCustom && (
                <div className="px-4 py-3 space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600 mb-1 block">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={customDates.start}
                      onChange={(e) =>
                        setCustomDates({ ...customDates, start: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-950 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-lg text-sm text-slate-200 dark:text-slate-200 light:text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600 mb-1 block">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={customDates.end}
                      onChange={(e) =>
                        setCustomDates({ ...customDates, end: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-950 dark:bg-slate-950 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-lg text-sm text-slate-200 dark:text-slate-200 light:text-gray-900"
                    />
                  </div>
                  <button
                    onClick={() => handleExport("custom")}
                    disabled={!customDates.start || !customDates.end}
                    className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Générer le rapport
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

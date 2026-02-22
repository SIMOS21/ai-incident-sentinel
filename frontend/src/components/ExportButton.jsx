import { useState } from "react";

export default function ExportButton({ incidents }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPDFOptions, setShowPDFOptions] = useState(false);
  const [pdfPeriod, setPdfPeriod] = useState("day");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [loadingPDF, setLoadingPDF] = useState(false);

  const exportCSV = () => {
    const headers = ["ID", "Date/Heure", "Source", "Type", "Sévérité", "Message", "Score", "Anomalie"];
    const rows = incidents.map((inc) => [
      inc.id,
      new Date(inc.timestamp).toLocaleString("fr-FR"),
      inc.source,
      inc.type,
      inc.severity,
      inc.message,
      inc.score?.toFixed(4) || "",
      inc.is_anomaly ? "Oui" : "Non",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `incidents_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    setIsOpen(false);
  };

  const exportJSON = () => {
    const jsonContent = JSON.stringify(incidents, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `incidents_${new Date().toISOString().split("T")[0]}.json`);
    link.click();
    setIsOpen(false);
  };

  const copyToClipboard = () => {
    const text = incidents
      .map(
        (inc) =>
          `${new Date(inc.timestamp).toLocaleString("fr-FR")} | ${inc.severity.toUpperCase()} | ${inc.source} | ${inc.message}`
      )
      .join("\n");

    navigator.clipboard.writeText(text);
    alert("✅ Copié dans le presse-papiers !");
    setIsOpen(false);
  };

  const exportPDF = async (period) => {
    setLoadingPDF(true);

    try {
      let url = `http://localhost:8000/v1/reports/generate?period=${period}`;

      if (period === "custom" && customDates.start && customDates.end) {
        url = `http://localhost:8000/v1/reports/generate?start_date=${customDates.start}&end_date=${customDates.end}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du rapport");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `rapport_incidents_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setIsOpen(false);
      setShowPDFOptions(false);
      alert("✅ Rapport PDF généré avec succès !");
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ Erreur lors de la génération du rapport PDF");
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>Exporter</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 dark:bg-slate-900 light:bg-white rounded-xl shadow-2xl border border-slate-700 dark:border-slate-700 light:border-gray-200 z-50 overflow-hidden">
          <div className="p-3">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-gray-600 uppercase tracking-wider px-2 py-2">
              {incidents.length} incidents à exporter
            </div>

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="w-full text-left px-4 py-3 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-gray-100 rounded-lg transition-colors group flex items-start space-x-3"
            >
              <div className="text-3xl">📊</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-gray-900">
                  Export CSV
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600">
                  Pour Excel, Google Sheets
                </div>
              </div>
              <svg
                className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors"
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
            </button>

            {/* Export JSON */}
            <button
              onClick={exportJSON}
              className="w-full text-left px-4 py-3 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-gray-100 rounded-lg transition-colors group flex items-start space-x-3"
            >
              <div className="text-3xl">📄</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-gray-900">
                  Export JSON
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600">
                  Format structuré
                </div>
              </div>
              <svg
                className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors"
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
            </button>

            {/* Copier texte */}
            <button
              onClick={copyToClipboard}
              className="w-full text-left px-4 py-3 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-gray-100 rounded-lg transition-colors group flex items-start space-x-3"
            >
              <div className="text-3xl">📋</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-gray-900">
                  Copier le texte
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600">
                  Dans le presse-papiers
                </div>
              </div>
              <svg
                className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors"
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
            </button>

            {/* Séparateur */}
            <div className="border-t border-slate-700 dark:border-slate-700 light:border-gray-200 my-2" />

            {/* Export PDF avec sous-menu */}
            <div>
              <button
                onClick={() => setShowPDFOptions(!showPDFOptions)}
                className="w-full text-left px-4 py-3 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-gray-100 rounded-lg transition-colors group flex items-start space-x-3"
              >
                <div className="text-3xl">📑</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-purple-400 dark:text-purple-400 light:text-purple-600">
                    Rapport PDF Détaillé
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600">
                    Analyse complète avec graphiques
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-all ${
                    showPDFOptions ? "rotate-90" : ""
                  }`}
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
              </button>

              {/* Sous-menu PDF */}
              {showPDFOptions && (
                <div className="ml-10 mr-2 space-y-2 mt-2 bg-slate-800/30 dark:bg-slate-800/30 light:bg-gray-50 rounded-lg p-2">
                  {loadingPDF ? (
                    <div className="flex items-center justify-center py-4">
                      <svg
                        className="animate-spin h-6 w-6 text-purple-400"
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
                      <span className="ml-2 text-sm text-purple-400">Génération en cours...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => exportPDF("day")}
                        className="w-full text-left px-3 py-2 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-200 rounded-md transition-colors text-xs"
                      >
                        <div className="text-slate-200 dark:text-slate-200 light:text-gray-900 font-medium">
                          📅 Rapport Aujourd'hui
                        </div>
                        <div className="text-slate-500 dark:text-slate-500 light:text-gray-600">
                          Incidents du jour
                        </div>
                      </button>

                      <button
                        onClick={() => exportPDF("week")}
                        className="w-full text-left px-3 py-2 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-200 rounded-md transition-colors text-xs"
                      >
                        <div className="text-slate-200 dark:text-slate-200 light:text-gray-900 font-medium">
                          📊 Rapport Hebdomadaire
                        </div>
                        <div className="text-slate-500 dark:text-slate-500 light:text-gray-600">
                          7 derniers jours
                        </div>
                      </button>

                      <button
                        onClick={() => exportPDF("month")}
                        className="w-full text-left px-3 py-2 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-200 rounded-md transition-colors text-xs"
                      >
                        <div className="text-slate-200 dark:text-slate-200 light:text-gray-900 font-medium">
                          📈 Rapport Mensuel
                        </div>
                        <div className="text-slate-500 dark:text-slate-500 light:text-gray-600">
                          30 derniers jours
                        </div>
                      </button>

                      <button
                        onClick={() => exportPDF("all")}
                        className="w-full text-left px-3 py-2 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-200 rounded-md transition-colors text-xs"
                      >
                        <div className="text-slate-200 dark:text-slate-200 light:text-gray-900 font-medium">
                          🗂️ Rapport Complet
                        </div>
                        <div className="text-slate-500 dark:text-slate-500 light:text-gray-600">
                          Tout l'historique
                        </div>
                      </button>

                      {/* Période personnalisée */}
                      <div className="border-t border-slate-700/50 dark:border-slate-700/50 light:border-gray-300 pt-2 mt-2">
                        <div className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600 px-3 py-1 font-medium">
                          Période personnalisée
                        </div>
                        <div className="px-3 py-2 space-y-2">
                          <input
                            type="date"
                            value={customDates.start}
                            onChange={(e) =>
                              setCustomDates({ ...customDates, start: e.target.value })
                            }
                            className="w-full px-2 py-1.5 bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded text-xs text-slate-200 dark:text-slate-200 light:text-gray-900"
                            placeholder="Date début"
                          />
                          <input
                            type="date"
                            value={customDates.end}
                            onChange={(e) =>
                              setCustomDates({ ...customDates, end: e.target.value })
                            }
                            className="w-full px-2 py-1.5 bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded text-xs text-slate-200 dark:text-slate-200 light:text-gray-900"
                            placeholder="Date fin"
                          />
                          <button
                            onClick={() => exportPDF("custom")}
                            disabled={!customDates.start || !customDates.end}
                            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-md text-xs font-semibold transition-colors disabled:cursor-not-allowed"
                          >
                            Générer
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

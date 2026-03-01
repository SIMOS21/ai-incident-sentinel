import { useState } from "react";
import { buildApiUrl } from "../services/api";

const EXPORT_ACTIONS = [
  {
    id: "csv",
    label: "Export CSV",
    desc: "For Excel, Google Sheets",
    iconPath: "M3 10h18M3 14h18M10 3v18M14 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    id: "json",
    label: "Export JSON",
    desc: "Structured data format",
    iconPath: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    id: "copy",
    label: "Copy to clipboard",
    desc: "Plain text format",
    iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
];

const PDF_PERIODS = [
  { key: "day",   label: "Today",       desc: "Incidents from today"      },
  { key: "week",  label: "This week",   desc: "Last 7 days"               },
  { key: "month", label: "This month",  desc: "Last 30 days"              },
  { key: "all",   label: "All time",    desc: "Complete history"          },
];

export default function ExportButton({ incidents }) {
  const [isOpen, setIsOpen]           = useState(false);
  const [showPDF, setShowPDF]         = useState(false);
  const [showCustom, setShowCustom]   = useState(false);
  const [loadingPDF, setLoadingPDF]   = useState(false);
  const [copied, setCopied]           = useState(false);
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  const close = () => { setIsOpen(false); setShowPDF(false); setShowCustom(false); };

  /* ===== Data exports ===== */
  const exportCSV = () => {
    const headers = ["ID", "Date/Time", "Source", "Type", "Severity", "Message", "Score", "Anomaly"];
    const rows = incidents.map((inc) => [
      inc.id,
      new Date(inc.timestamp).toLocaleString("en-US"),
      inc.source,
      inc.type,
      inc.severity,
      inc.message,
      inc.score?.toFixed(4) || "",
      inc.is_anomaly ? "Yes" : "No",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `incidents_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    close();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(incidents, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `incidents_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    close();
  };

  const copyToClipboard = async () => {
    const text = incidents
      .map((inc) =>
        `${new Date(inc.timestamp).toLocaleString("en-US")} | ${inc.severity.toUpperCase()} | ${inc.source} | ${inc.message}`
      )
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => { setCopied(false); close(); }, 1200);
  };

  const handleAction = (id) => {
    if (id === "csv")  exportCSV();
    if (id === "json") exportJSON();
    if (id === "copy") copyToClipboard();
  };

  /* ===== PDF export ===== */
  const exportPDF = async (period) => {
    setLoadingPDF(true);
    try {
      let url;
      if (period === "custom" && customDates.start && customDates.end) {
        url = `${buildApiUrl("/reports/generate")}?start_date=${customDates.start}&end_date=${customDates.end}`;
      } else {
        url = `${buildApiUrl("/reports/generate")}?period=${period}`;
      }

      const response = await fetch(url, { headers: { Accept: "application/pdf" } });
      if (!response.ok) throw new Error("Report generation failed");

      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = `report_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      close();
    } catch {
      alert("Error generating PDF report.");
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="relative">

      {/* ===== Trigger button ===== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl font-semibold transition-all text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Export</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ===== Dropdown ===== */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={close} />

          <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/60 z-50 overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Export data</p>
                <p className="text-xs text-slate-600 mt-0.5">{incidents.length} incidents</p>
              </div>
              <button onClick={close} className="text-slate-600 hover:text-slate-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-2">
              {/* Data export actions */}
              {EXPORT_ACTIONS.map(({ id, label, desc, iconPath, color, bg }) => (
                <button
                  key={id}
                  onClick={() => handleAction(id)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-4 h-4 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {id === "copy" && copied ? "Copied!" : label}
                    </p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

              {/* Divider */}
              <div className="my-2 border-t border-slate-800/60" />

              {/* PDF section */}
              <button
                onClick={() => { setShowPDF(!showPDF); setShowCustom(false); }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-purple-300 group-hover:text-purple-200 transition-colors">
                    PDF Report
                  </p>
                  <p className="text-xs text-slate-500">Executive summary with charts</p>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-600 transition-all ${showPDF ? "rotate-90" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* PDF period picker */}
              {showPDF && (
                <div className="ml-11 mr-1 mt-1 mb-1 space-y-0.5">
                  {loadingPDF ? (
                    <div className="flex items-center justify-center py-4 space-x-2">
                      <svg className="animate-spin h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs text-purple-400">Generating report…</span>
                    </div>
                  ) : (
                    <>
                      {PDF_PERIODS.map(({ key, label, desc }) => (
                        <button
                          key={key}
                          onClick={() => exportPDF(key)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors group"
                        >
                          <p className="text-xs font-semibold text-slate-300 group-hover:text-white">{label}</p>
                          <p className="text-xs text-slate-600">{desc}</p>
                        </button>
                      ))}

                      {/* Custom range */}
                      <button
                        onClick={() => setShowCustom(!showCustom)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors group flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-300 group-hover:text-white">Custom range</p>
                          <p className="text-xs text-slate-600">Pick start & end dates</p>
                        </div>
                        <svg
                          className={`w-3.5 h-3.5 text-slate-600 transition-transform ${showCustom ? "rotate-90" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {showCustom && (
                        <div className="px-3 pb-2 pt-1 space-y-2">
                          <input
                            type="date"
                            value={customDates.start}
                            onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-950/70 border border-slate-700/60 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                          />
                          <input
                            type="date"
                            value={customDates.end}
                            onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-950/70 border border-slate-700/60 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                          />
                          <button
                            onClick={() => exportPDF("custom")}
                            disabled={!customDates.start || !customDates.end || customDates.start > customDates.end}
                            className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed"
                          >
                            Generate
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

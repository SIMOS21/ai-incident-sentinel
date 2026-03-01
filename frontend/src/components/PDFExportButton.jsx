import { useMemo, useState } from "react";
import { buildApiUrl } from "../services/api";

export default function PDFExportButton({ variant = "dashboard" }) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [showCustom, setShowCustom] = useState(false);

  const selectedRangeInvalid = useMemo(() => {
    if (!customDates.start || !customDates.end) return false;
    return customDates.start > customDates.end;
  }, [customDates.end, customDates.start]);

  const handleExport = async (selectedPeriod) => {
    if (selectedPeriod === "custom") {
      if (!customDates.start || !customDates.end) {
        setErrorMessage("Please select a start date and an end date.");
        return;
      }
      if (selectedRangeInvalid) {
        setErrorMessage("Start date must be before end date.");
        return;
      }
    }

    setErrorMessage("");
    setLoading(true);
    setShowMenu(false);

    try {
      const params = new URLSearchParams();
      if (selectedPeriod === "custom" && customDates.start && customDates.end) {
        params.set("start_date", customDates.start);
        params.set("end_date", customDates.end);
      } else {
        params.set("period", selectedPeriod);
      }

      const url = `${buildApiUrl("/reports/generate")}?${params.toString()}`;
      const response = await fetch(url, { headers: { Accept: "application/pdf" } });

      if (!response.ok) throw new Error("Report generation failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `incident_report_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Error generating PDF report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isCompact = variant === "compact";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className={`flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed ${
          isCompact ? "px-3 py-2 text-sm" : "px-4 py-2"
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Generating…</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>{isCompact ? "PDF" : "PDF Report"}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${showMenu ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-60 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50 overflow-hidden">
          <div className="p-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
              Select period
            </div>

            {[
              { period: "day",   label: "Today",      desc: "Today's report"  },
              { period: "week",  label: "This week",  desc: "Last 7 days"     },
              { period: "month", label: "This month", desc: "Last 30 days"    },
              { period: "all",   label: "All time",   desc: "Full history"    },
            ].map(({ period, label, desc }) => (
              <button
                key={period}
                type="button"
                onClick={() => handleExport(period)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-700/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{label}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}

            <div className="border-t border-slate-700 mt-1 pt-1">
              <button
                type="button"
                onClick={() => setShowCustom(!showCustom)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-slate-200">Custom range</div>
              </button>

              {showCustom && (
                <div className="px-4 py-3 space-y-2.5">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Start date</label>
                    <input
                      type="date"
                      value={customDates.start}
                      onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">End date</label>
                    <input
                      type="date"
                      value={customDates.end}
                      onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    />
                  </div>
                  {errorMessage && (
                    <p className="text-xs text-red-400">{errorMessage}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleExport("custom")}
                    disabled={!customDates.start || !customDates.end || selectedRangeInvalid}
                    className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Generate report
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

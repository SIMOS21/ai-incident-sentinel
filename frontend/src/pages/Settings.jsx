import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { buildApiUrl } from "../services/api";

const ITEMS_PER_PAGE_OPTIONS = [10, 15, 25, 50, 100];

const EMAIL_THRESHOLD_OPTIONS = [
  { value: "critical", label: "Critical only"    },
  { value: "high",     label: "High & Critical"  },
];

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: { enabled: true, sound: true, highSeverityOnly: false },
    api: { endpoint: "http://localhost:8000", timeout: 30, retries: 3 },
    display: { itemsPerPage: 15, autoRefresh: true, refreshInterval: 30 },
    alerts: { email: "", emailEnabled: false, threshold: "critical" },
  });
  const [saved, setSaved] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Load email config from backend on mount
  useEffect(() => {
    fetch(buildApiUrl("/admin/email-config"))
      .then((r) => r.ok ? r.json() : null)
      .then((cfg) => {
        if (cfg) {
          setSettings((prev) => ({
            ...prev,
            alerts: {
              email: cfg.receiver || "",
              emailEnabled: cfg.enabled || false,
              threshold: cfg.threshold || "critical",
            },
          }));
        }
      })
      .catch(() => {/* backend not reachable — keep defaults */});
  }, []);

  const handleSave = async () => {
    // Persist non-email settings to localStorage
    localStorage.setItem("app-settings", JSON.stringify(settings));

    // Persist email config to backend
    setEmailError("");
    try {
      const res = await fetch(buildApiUrl("/admin/email-config"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled:   settings.alerts.emailEnabled,
          receiver:  settings.alerts.email,
          threshold: settings.alerts.threshold,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setEmailError(err.detail || "Failed to save email config");
        return;
      }
    } catch {
      setEmailError("Could not reach backend — email config not saved");
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all settings to defaults?")) {
      const defaults = {
        notifications: { enabled: true, sound: true, highSeverityOnly: false },
        api: { endpoint: "http://localhost:8000", timeout: 30, retries: 3 },
        display: { itemsPerPage: 15, autoRefresh: true, refreshInterval: 30 },
        alerts: { email: "", emailEnabled: false, threshold: "critical" },
      };
      setSettings(defaults);
      localStorage.removeItem("app-settings");
    }
  };

  const set = (section, key, value) =>
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-1">
          Settings
        </h1>
        <p className="text-slate-400 text-sm">Configure your application preferences</p>
      </div>

      <div className="max-w-4xl space-y-5">

        {/* Appearance */}
        <SettingsSection
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Appearance"
          description="Customize the interface look"
        >
          <SettingItem label="Theme" description="Switch between dark and light mode">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 text-sm"
            >
              {theme === "dark" ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                  <span>Switch to Light</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                  <span>Switch to Dark</span>
                </>
              )}
            </button>
          </SettingItem>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          }
          title="Notifications"
          description="Manage alerts and in-app notifications"
        >
          <SettingItem label="Enable notifications" description="Receive alerts for new incidents">
            <ToggleSwitch
              enabled={settings.notifications.enabled}
              onChange={(v) => set("notifications", "enabled", v)}
            />
          </SettingItem>
          <SettingItem label="Notification sound" description="Play a sound when a new alert arrives">
            <ToggleSwitch
              enabled={settings.notifications.sound}
              onChange={(v) => set("notifications", "sound", v)}
            />
          </SettingItem>
          <SettingItem label="High severity only" description="Only notify for critical and high incidents">
            <ToggleSwitch
              enabled={settings.notifications.highSeverityOnly}
              onChange={(v) => set("notifications", "highSeverityOnly", v)}
            />
          </SettingItem>
        </SettingsSection>

        {/* API Configuration */}
        <SettingsSection
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-13.5 0v-1.5m0-7.5h13.5m-13.5 0a3 3 0 00-3 3m3-3a3 3 0 100-6h13.5a3 3 0 100 6m-13.5 0v1.5m13.5 7.5v-1.5m0-7.5v1.5m0 0a3 3 0 003-3m-3 3a3 3 0 11-3-3" />
            </svg>
          }
          title="API Configuration"
          description="Backend connection settings"
        >
          <SettingItem label="API endpoint" description="URL of the backend server">
            <input
              type="text"
              value={settings.api.endpoint}
              onChange={(e) => set("api", "endpoint", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/60 rounded-xl text-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
            />
          </SettingItem>
          <SettingItem label="Timeout (seconds)" description="Maximum wait time for requests">
            <input
              type="number"
              value={settings.api.timeout}
              onChange={(e) => set("api", "timeout", parseInt(e.target.value))}
              min="5" max="120"
              className="w-28 px-4 py-2.5 bg-slate-950/50 border border-slate-700/60 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
            />
          </SettingItem>
          <SettingItem label="Reconnection attempts" description="Number of retries on failure">
            <input
              type="number"
              value={settings.api.retries}
              onChange={(e) => set("api", "retries", parseInt(e.target.value))}
              min="0" max="10"
              className="w-28 px-4 py-2.5 bg-slate-950/50 border border-slate-700/60 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
            />
          </SettingItem>
        </SettingsSection>

        {/* Display */}
        <SettingsSection
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
            </svg>
          }
          title="Display"
          description="Data display options"
        >
          <SettingItem label="Items per page" description="Number of incidents shown per page">
            <div className="flex items-center bg-slate-950/50 border border-slate-800/60 rounded-xl p-1 gap-0.5">
              {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => set("display", "itemsPerPage", n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.display.itemsPerPage === n
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </SettingItem>
          <SettingItem label="Auto-refresh" description="Automatically update data in the background">
            <ToggleSwitch
              enabled={settings.display.autoRefresh}
              onChange={(v) => set("display", "autoRefresh", v)}
            />
          </SettingItem>
          <SettingItem label="Refresh interval (seconds)" description="How often to fetch new data">
            <input
              type="number"
              value={settings.display.refreshInterval}
              onChange={(e) => set("display", "refreshInterval", parseInt(e.target.value))}
              min="5" max="300"
              disabled={!settings.display.autoRefresh}
              className="w-28 px-4 py-2.5 bg-slate-950/50 border border-slate-700/60 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </SettingItem>
        </SettingsSection>

        {/* Email Alerts */}
        <SettingsSection
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
          title="Email Alerts"
          description="Receive incident alerts via email"
        >
          <SettingItem label="Enable email alerts" description="Send notification emails for new incidents">
            <ToggleSwitch
              enabled={settings.alerts.emailEnabled}
              onChange={(v) => set("alerts", "emailEnabled", v)}
            />
          </SettingItem>
          <SettingItem label="Email address" description="Where to send alert emails">
            <input
              type="email"
              value={settings.alerts.email}
              onChange={(e) => set("alerts", "email", e.target.value)}
              placeholder="your@email.com"
              disabled={!settings.alerts.emailEnabled}
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </SettingItem>
          <SettingItem label="Alert threshold" description="Minimum severity level to trigger an email">
            <div className={`flex items-center bg-slate-950/50 border border-slate-800/60 rounded-xl p-1 gap-0.5 transition-opacity ${!settings.alerts.emailEnabled ? "opacity-40 pointer-events-none" : ""}`}>
              {EMAIL_THRESHOLD_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => set("alerts", "threshold", value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    settings.alerts.threshold === value
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </SettingItem>
        </SettingsSection>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-400 hover:text-slate-200 rounded-xl transition-all font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset to defaults
          </button>

          <div className="flex items-center gap-4">
            {emailError && (
              <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {emailError}
              </span>
            )}
            {saved && (
              <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Settings saved!
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ icon, title, description, children }) {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-cyan-400">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-200">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="space-y-5 divide-y divide-slate-800/60">
        {children}
      </div>
    </div>
  );
}

function SettingItem({ label, description, children }) {
  return (
    <div className="flex items-center justify-between pt-5 first:pt-0">
      <div className="flex-1 pr-6">
        <p className="text-sm font-semibold text-slate-300">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        enabled ? "bg-gradient-to-r from-cyan-600 to-blue-600" : "bg-slate-700"
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

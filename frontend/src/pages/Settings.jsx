import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      sound: true,
      highSeverityOnly: false,
    },
    api: {
      endpoint: "http://localhost:8000",
      timeout: 30,
      retries: 3,
    },
    display: {
      itemsPerPage: 15,
      autoRefresh: true,
      refreshInterval: 30,
    },
    alerts: {
      email: "",
      emailEnabled: false,
      threshold: "high",
    },
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Sauvegarder dans localStorage
    localStorage.setItem("app-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?")) {
      const defaultSettings = {
        notifications: {
          enabled: true,
          sound: true,
          highSeverityOnly: false,
        },
        api: {
          endpoint: "http://localhost:8000",
          timeout: 30,
          retries: 3,
        },
        display: {
          itemsPerPage: 15,
          autoRefresh: true,
          refreshInterval: 30,
        },
        alerts: {
          email: "",
          emailEnabled: false,
          threshold: "high",
        },
      };
      setSettings(defaultSettings);
      localStorage.removeItem("app-settings");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-gray-50 light:via-white light:to-gray-50 p-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
          Paramètres
        </h1>
        <p className="text-slate-400 dark:text-slate-400 light:text-gray-600">
          Configuration de l'application
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Apparence */}
        <SettingsSection
          title="🎨 Apparence"
          description="Personnalisez l'interface"
        >
          <SettingItem label="Thème" description="Mode clair ou sombre">
            <button
              onClick={toggleTheme}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              {theme === "dark" ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                  <span>Passer au mode clair</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                  <span>Passer au mode sombre</span>
                </>
              )}
            </button>
          </SettingItem>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection
          title="🔔 Notifications"
          description="Gérez vos alertes et notifications"
        >
          <SettingItem
            label="Activer les notifications"
            description="Recevoir des alertes pour les nouveaux incidents"
          >
            <ToggleSwitch
              enabled={settings.notifications.enabled}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, enabled: value },
                })
              }
            />
          </SettingItem>

          <SettingItem
            label="Son des notifications"
            description="Jouer un son lors d'une nouvelle alerte"
          >
            <ToggleSwitch
              enabled={settings.notifications.sound}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, sound: value },
                })
              }
            />
          </SettingItem>

          <SettingItem
            label="Incidents critiques uniquement"
            description="Ne notifier que pour les incidents de haute sévérité"
          >
            <ToggleSwitch
              enabled={settings.notifications.highSeverityOnly}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    highSeverityOnly: value,
                  },
                })
              }
            />
          </SettingItem>
        </SettingsSection>

        {/* API Configuration */}
        <SettingsSection
          title="🔌 Configuration API"
          description="Paramètres de connexion au backend"
        >
          <SettingItem
            label="Endpoint API"
            description="URL du serveur backend"
          >
            <input
              type="text"
              value={settings.api.endpoint}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  api: { ...settings.api, endpoint: e.target.value },
                })
              }
              className="w-full px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 font-mono"
            />
          </SettingItem>

          <SettingItem
            label="Timeout (secondes)"
            description="Délai d'attente maximum pour les requêtes"
          >
            <input
              type="number"
              value={settings.api.timeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  api: { ...settings.api, timeout: parseInt(e.target.value) },
                })
              }
              min="5"
              max="120"
              className="w-32 px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
            />
          </SettingItem>

          <SettingItem
            label="Tentatives de reconnexion"
            description="Nombre de tentatives en cas d'échec"
          >
            <input
              type="number"
              value={settings.api.retries}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  api: { ...settings.api, retries: parseInt(e.target.value) },
                })
              }
              min="0"
              max="10"
              className="w-32 px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
            />
          </SettingItem>
        </SettingsSection>

        {/* Affichage */}
        <SettingsSection
          title="📺 Affichage"
          description="Options d'affichage des données"
        >
          <SettingItem
            label="Éléments par page"
            description="Nombre d'incidents affichés par page"
          >
            <select
              value={settings.display.itemsPerPage}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  display: {
                    ...settings.display,
                    itemsPerPage: parseInt(e.target.value),
                  },
                })
              }
              className="px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 cursor-pointer"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </SettingItem>

          <SettingItem
            label="Rafraîchissement automatique"
            description="Mettre à jour les données automatiquement"
          >
            <ToggleSwitch
              enabled={settings.display.autoRefresh}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  display: { ...settings.display, autoRefresh: value },
                })
              }
            />
          </SettingItem>

          <SettingItem
            label="Intervalle de rafraîchissement (secondes)"
            description="Fréquence de mise à jour des données"
          >
            <input
              type="number"
              value={settings.display.refreshInterval}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  display: {
                    ...settings.display,
                    refreshInterval: parseInt(e.target.value),
                  },
                })
              }
              min="5"
              max="300"
              disabled={!settings.display.autoRefresh}
              className="w-32 px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </SettingItem>
        </SettingsSection>

        {/* Alertes Email */}
        <SettingsSection
          title="📧 Alertes Email"
          description="Recevoir des alertes par email"
        >
          <SettingItem
            label="Activer les alertes email"
            description="Recevoir des notifications par email"
          >
            <ToggleSwitch
              enabled={settings.alerts.emailEnabled}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  alerts: { ...settings.alerts, emailEnabled: value },
                })
              }
            />
          </SettingItem>

          <SettingItem label="Adresse email" description="Email de réception des alertes">
            <input
              type="email"
              value={settings.alerts.email}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  alerts: { ...settings.alerts, email: e.target.value },
                })
              }
              placeholder="votre@email.com"
              disabled={!settings.alerts.emailEnabled}
              className="w-full px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </SettingItem>

          <SettingItem
            label="Seuil d'alerte"
            description="Niveau minimum pour déclencher une alerte"
          >
            <select
              value={settings.alerts.threshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  alerts: { ...settings.alerts, threshold: e.target.value },
                })
              }
              disabled={!settings.alerts.emailEnabled}
              className="px-4 py-3 bg-slate-950/50 dark:bg-slate-950/50 light:bg-gray-100 border border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl text-slate-200 dark:text-slate-200 light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="low">Tous les incidents</option>
              <option value="medium">Moyens et critiques</option>
              <option value="high">Critiques uniquement</option>
            </select>
          </SettingItem>
        </SettingsSection>

        {/* Boutons d'action */}
        <div className="flex items-center justify-between pt-6">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-200 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-gray-300 text-slate-300 dark:text-slate-300 light:text-gray-700 rounded-xl transition-all duration-300 font-semibold"
          >
            Réinitialiser
          </button>

          <div className="flex items-center space-x-4">
            {saved && (
              <span className="text-green-400 font-medium flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Paramètres sauvegardés !</span>
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              💾 Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composants helper
function SettingsSection({ title, description, children }) {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 dark:from-slate-900/90 dark:to-slate-800/50 light:from-white light:to-gray-50 rounded-2xl border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200 p-6 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-200 dark:text-slate-200 light:text-gray-900 mb-1">
          {title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-500 light:text-gray-600">
          {description}
        </p>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function SettingItem({ label, description, children }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 pr-4">
        <label className="text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-gray-900 block mb-1">
          {label}
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600">
          {description}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ToggleSwitch({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
        enabled
          ? "bg-gradient-to-r from-cyan-600 to-blue-600"
          : "bg-slate-700 dark:bg-slate-700 light:bg-gray-300"
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

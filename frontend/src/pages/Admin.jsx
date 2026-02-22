import { useState, useEffect, useRef } from "react";

export default function Admin() {
  const [generatorRunning, setGeneratorRunning] = useState(false);
  const [settings, setSettings] = useState({
    interval: 3,
    anomalyRate: 30,
  });
  const [stats, setStats] = useState({
    generated: 0,
    totalToday: 0,
    lastIncident: null,
  });
  const [logs, setLogs] = useState([]);
  
  const statusCheckInterval = useRef(null);

  // Vérifier le statut du générateur toutes les 2 secondes
  useEffect(() => {
    checkGeneratorStatus();
    
    statusCheckInterval.current = setInterval(() => {
      checkGeneratorStatus();
    }, 2000);

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);

  // Vérifier le statut du générateur backend
  const checkGeneratorStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/v1/admin/generator/status");
      if (response.ok) {
        const data = await response.json();
        setGeneratorRunning(data.running);
        setStats(prev => ({
          ...prev,
          generated: data.generated
        }));
      }
    } catch (error) {
      console.error("Erreur statut:", error);
    }
  };

  // Récupérer les stats admin
  const fetchAdminStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/v1/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          totalToday: data.today_count,
          lastIncident: data.last_incident
        }));
      }
    } catch (error) {
      console.error("Erreur stats:", error);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    const interval = setInterval(fetchAdminStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Démarrer la génération (backend)
  const startGenerator = async () => {
    try {
      const response = await fetch("http://localhost:8000/v1/admin/generator/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratorRunning(true);
        addLog("✅ Générateur démarré en arrière-plan", "success");
        addLog(`⚙️ Intervalle: ${settings.interval}s, Anomalies: ${settings.anomalyRate}%`, "info");
      } else {
        const data = await response.json();
        addLog(`⚠️ ${data.message}`, "warning");
      }
    } catch (error) {
      addLog("❌ Erreur lors du démarrage", "error");
    }
  };

  // Arrêter la génération
  const stopGenerator = async () => {
    try {
      const response = await fetch("http://localhost:8000/v1/admin/generator/stop", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratorRunning(false);
        addLog(`🛑 ${data.message}`, "info");
      }
    } catch (error) {
      addLog("❌ Erreur lors de l'arrêt", "error");
    }
  };

  // Générer un nombre précis
  const generateExact = async (count) => {
    addLog(`🔄 Génération de ${count} incidents...`, "info");
    
    try {
      const response = await fetch("http://localhost:8000/v1/admin/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`✅ ${data.generated} incidents générés`, "success");
        fetchAdminStats();
      }
    } catch (error) {
      addLog("❌ Erreur", "error");
    }
  };

  // Scénario de crise
  const createCrisis = async () => {
    addLog("🚨 Simulation d'une crise système...", "warning");
    
    try {
      const response = await fetch("http://localhost:8000/v1/admin/crisis-scenario", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`🚨 Crise simulée : ${data.critical} incidents critiques`, "warning");
        fetchAdminStats();
      }
    } catch (error) {
      addLog("❌ Erreur", "error");
    }
  };

  // Vider la base
  const clearDatabase = async () => {
    if (!window.confirm("⚠️ Supprimer TOUS les incidents ?\n\nCette action est irréversible.")) {
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/v1/admin/clear-database", {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`🗑️ ${data.deleted} incidents supprimés`, "success");
        setStats({ generated: 0, totalToday: 0, lastIncident: null });
        fetchAdminStats();
      }
    } catch (error) {
      addLog("❌ Erreur", "error");
    }
  };

  // Ajouter un log
  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString("fr-FR");
    setLogs(prev => [{ timestamp, message, type }, ...prev.slice(0, 99)]);
  };

  const getLogColor = (type) => {
    switch (type) {
      case "success": return "text-green-400";
      case "error": return "text-red-400";
      case "warning": return "text-yellow-400";
      default: return "text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
          🎛️ Panneau d'Administration
        </h1>
        <p className="text-slate-400">
          Contrôlez le système et générez des données de test - Le générateur continue en arrière-plan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contrôle du générateur */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-200">🎮 Générateur Continu (Backend)</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${generatorRunning ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className="text-sm text-slate-400">{generatorRunning ? "En cours" : "Arrêté"}</span>
              </div>
            </div>

            {generatorRunning && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-sm text-green-400">
                  ✅ Le générateur tourne en arrière-plan. Vous pouvez changer de page, il continuera !
                </p>
              </div>
            )}

            {/* Compteur temps réel */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-800/30 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Session backend</p>
                <p className="text-3xl font-bold text-cyan-400">{stats.generated}</p>
                <p className="text-xs text-slate-600 mt-1">depuis démarrage</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Total aujourd'hui</p>
                <p className="text-3xl font-bold text-blue-400">{stats.totalToday}</p>
                <p className="text-xs text-slate-600 mt-1">dans la base</p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={startGenerator}
                disabled={generatorRunning}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg"
              >
                ▶️ Démarrer
              </button>
              <button
                onClick={stopGenerator}
                disabled={!generatorRunning}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg"
              >
                ⏹️ Arrêter
              </button>
            </div>

            {/* Paramètres */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">
                  ⏱️ Intervalle (secondes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.interval}
                  onChange={(e) => setSettings({ ...settings, interval: parseInt(e.target.value) })}
                  disabled={generatorRunning}
                  className="w-full px-4 py-2 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-200 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">
                  ⚡ Taux d'anomalies (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.anomalyRate}
                  onChange={(e) => setSettings({ ...settings, anomalyRate: parseInt(e.target.value) })}
                  disabled={generatorRunning}
                  className="w-full px-4 py-2 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-200 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-200 mb-6">⚡ Actions Rapides</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => generateExact(10)}
                className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-left transition-all group"
              >
                <div className="text-3xl mb-2">🧪</div>
                <div className="text-white font-bold mb-1 group-hover:translate-x-1 transition-transform">Générer 10</div>
                <div className="text-white/80 text-xs">Données de test</div>
              </button>

              <button
                onClick={() => generateExact(50)}
                className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-left transition-all group"
              >
                <div className="text-3xl mb-2">📊</div>
                <div className="text-white font-bold mb-1 group-hover:translate-x-1 transition-transform">Générer 50</div>
                <div className="text-white/80 text-xs">Dataset moyen</div>
              </button>

              <button
                onClick={createCrisis}
                className="p-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl text-left transition-all group"
              >
                <div className="text-3xl mb-2">🚨</div>
                <div className="text-white font-bold mb-1 group-hover:translate-x-1 transition-transform">Scénario de crise</div>
                <div className="text-white/80 text-xs">20 incidents critiques</div>
              </button>

              <button
                onClick={clearDatabase}
                className="p-4 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 rounded-xl text-left transition-all group"
              >
                <div className="text-3xl mb-2">🗑️</div>
                <div className="text-white font-bold mb-1 group-hover:translate-x-1 transition-transform">Vider la base</div>
                <div className="text-white/80 text-xs">Supprimer tous les incidents</div>
              </button>
            </div>
          </div>

          {/* Dernier incident */}
          {stats.lastIncident && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-200 mb-4">📍 Dernier Incident</h2>
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  stats.lastIncident.severity === "high" ? "bg-red-500/20 text-red-400" :
                  stats.lastIncident.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-green-500/20 text-green-400"
                }`}>
                  {stats.lastIncident.severity === "high" ? "🔴" :
                   stats.lastIncident.severity === "medium" ? "🟡" : "🟢"}
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 font-medium">
                    Sévérité: <span className="uppercase">{stats.lastIncident.severity}</span>
                  </p>
                  <p className="text-slate-500 text-sm">
                    {new Date(stats.lastIncident.timestamp).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite - Console */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-700/50 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-200">📝 Console</h2>
              <button
                onClick={() => setLogs([])}
                className="text-xs px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 rounded-full transition-colors text-slate-300"
              >
                Effacer
              </button>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-4 h-[700px] overflow-y-auto font-mono text-sm space-y-2">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  Aucun événement enregistré
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs border-b border-slate-800/50 pb-2">
                    <span className="text-slate-600 w-20 flex-shrink-0">{log.timestamp}</span>
                    <span className={getLogColor(log.type)}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

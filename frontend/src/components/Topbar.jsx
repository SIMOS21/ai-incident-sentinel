import { useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  const location = useLocation();

  // Définir le titre et la description selon la page
  const getPageInfo = () => {
    switch (location.pathname) {
      case "/":
        return {
          title: "AI Sentinel Dashboard",
          description: "Vue d'ensemble des incidents",
        };
      case "/incidents":
        return {
          title: "Gestion des Incidents",
          description: "Liste et détails des incidents détectés",
        };
      case "/analytics":
        return {
          title: "Analytiques",
          description: "Statistiques et rapports détaillés",
        };
      case "/settings":
        return {
          title: "Paramètres",
          description: "Configuration de l'application",
        };
      default:
        return {
          title: "AI Sentinel",
          description: "Surveillance des incidents IA",
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 border-b border-slate-800/50 dark:border-slate-800/50 light:border-gray-200 transition-colors duration-300">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Titre de la page - Dynamique */}
        <div>
          <h2 className="text-lg font-semibold text-slate-200 dark:text-slate-200 light:text-gray-900">
            {pageInfo.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600 mt-0.5">
            {pageInfo.description}
          </p>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center space-x-4">
          {/* Bouton de thème */}
          <ThemeToggle />

          {/* Indicateur de statut */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-100 rounded-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-700 font-medium">
              Système en ligne
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Topbar({ onMenuClick }) {
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case "/":
        return { title: "AI Sentinel Dashboard", description: "Real-time incident overview" };
      case "/incidents":
        return { title: "Incident Management", description: "Browse and inspect detected incidents" };
      case "/analytics":
        return { title: "Analytics", description: "Statistics and detailed reports" };
      case "/admin":
        return { title: "Admin Panel", description: "System control and data ingestion" };
      case "/settings":
        return { title: "Settings", description: "Application configuration" };
      default:
        return { title: "AI Sentinel", description: "AI incident monitoring" };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 border-b border-slate-800/50 dark:border-slate-800/50 light:border-gray-200 transition-colors duration-300">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between">

        {/* Left: hamburger (mobile) + page title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            className="md:hidden flex-shrink-0 p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-slate-200 dark:text-slate-200 light:text-gray-900 truncate">
              {pageInfo.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-600 mt-0.5 hidden sm:block">
              {pageInfo.description}
            </p>
          </div>
        </div>

        {/* Right: theme toggle + status */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <ThemeToggle />
          <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-100 rounded-lg border border-slate-700/50 dark:border-slate-700/50 light:border-gray-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-700 font-medium">
              System online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

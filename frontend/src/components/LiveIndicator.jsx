export default function LiveIndicator({ isLive, lastUpdate, onToggle, newCount = 0 }) {
  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // secondes

    if (diff < 60) return `il y a ${diff}s`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Indicateur LIVE */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggle}
          className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
            isLive
              ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/50"
              : "bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-200 text-slate-400 dark:text-slate-400 light:text-gray-700"
          }`}
        >
          {/* Point clignotant */}
          {isLive && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          )}
          <span className="text-sm uppercase tracking-wider">
            {isLive ? "🔴 LIVE" : "⏸ Pause"}
          </span>
        </button>

        {/* Badge nouveaux incidents */}
        {newCount > 0 && (
          <div className="animate-bounce">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
              +{newCount} nouveau{newCount > 1 ? "x" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Dernière mise à jour */}
      {lastUpdate && (
        <div className="text-sm text-slate-400 dark:text-slate-400 light:text-gray-600 flex items-center space-x-2">
          <svg
            className={`w-4 h-4 ${isLive ? "animate-spin" : ""}`}
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
          <span>{formatTime(lastUpdate)}</span>
        </div>
      )}
    </div>
  );
}

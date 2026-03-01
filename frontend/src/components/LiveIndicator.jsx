import { useState, useEffect } from "react";
import { useLive } from "../context/LiveContext";

export default function LiveIndicator({ lastUpdate, newCount = 0 }) {
  const { isLive, toggleLive } = useLive();
  const [, setTick] = useState(0);

  // Force rerender every second to keep the timestamp fresh
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const diff = Math.max(0, Math.floor((now - new Date(date)) / 1000));

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;

    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleLive}
          className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
            isLive
              ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/50"
              : "bg-slate-800/50 text-slate-400"
          }`}
        >
          {isLive && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          )}
          <span className="text-sm uppercase tracking-wider">
            {isLive ? "LIVE" : "PAUSE"}
          </span>
        </button>

        {newCount > 0 && (
          <div className="animate-bounce">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
              +{newCount} new
            </span>
          </div>
        )}
      </div>

      {lastUpdate && (
        <div className="text-sm text-slate-400 flex items-center space-x-2">
          <span>{formatTime(lastUpdate)}</span>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect } from "react";

const SEVERITY_STYLES = {
  critical: {
    bg: "from-rose-900/90 to-rose-950/90",
    border: "border-rose-500/50",
    text: "text-rose-400",
    bar: "bg-rose-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  high: {
    bg: "from-red-900/90 to-red-950/90",
    border: "border-red-500/50",
    text: "text-red-400",
    bar: "bg-red-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  medium: {
    bg: "from-yellow-900/90 to-yellow-950/90",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
    bar: "bg-yellow-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  low: {
    bg: "from-green-900/90 to-green-950/90",
    border: "border-green-500/50",
    text: "text-green-400",
    bar: "bg-green-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const DEFAULT_STYLE = {
  bg: "from-slate-900/90 to-slate-950/90",
  border: "border-slate-500/50",
  text: "text-slate-400",
  bar: "bg-slate-500",
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function NotificationSystem({ incidents }) {
  const [notifications, setNotifications] = useState([]);
  const [lastIncidentId, setLastIncidentId] = useState(null);

  useEffect(() => {
    if (incidents.length === 0) return;

    const latestIncident = incidents[0];

    if (lastIncidentId === null) {
      setLastIncidentId(latestIncident.id);
      return;
    }

    if (latestIncident.id !== lastIncidentId) {
      const notification = {
        id: Date.now(),
        incident: latestIncident,
        timestamp: new Date(),
      };

      setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
      setLastIncidentId(latestIncident.id);

      if (latestIncident.severity === "high" || latestIncident.severity === "critical") {
        playNotificationSound();
      }

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 10000);
    }
  }, [incidents, lastIncidentId]);

  const playNotificationSound = () => {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => {
        const styles = SEVERITY_STYLES[notification.incident.severity] ?? DEFAULT_STYLE;
        return (
          <div
            key={notification.id}
            style={{ animation: "slideInRight 0.3s ease-out" }}
            className={`bg-gradient-to-r ${styles.bg} backdrop-blur-xl border ${styles.border} rounded-xl shadow-2xl overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Severity icon */}
                <div className={`shrink-0 mt-0.5 ${styles.text}`}>
                  {styles.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold text-xs uppercase tracking-wide ${styles.text}`}>
                      New incident
                    </h4>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-slate-600 hover:text-slate-300 transition-colors -mt-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-slate-200 text-sm leading-snug mb-2 line-clamp-2">
                    {notification.incident.message}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                      </svg>
                      <span className="truncate max-w-[100px]">{notification.incident.source}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {notification.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-slate-800/60">
              <div
                className={`h-full ${styles.bar} opacity-60`}
                style={{ animation: "shrink 10s linear forwards" }}
              />
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(420px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%;   }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

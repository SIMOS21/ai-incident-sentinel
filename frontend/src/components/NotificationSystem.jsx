import { useState, useEffect } from "react";

export default function NotificationSystem({ incidents }) {
  const [notifications, setNotifications] = useState([]);
  const [lastIncidentId, setLastIncidentId] = useState(null);

  useEffect(() => {
    if (incidents.length === 0) return;

    const latestIncident = incidents[0];
    
    // Vérifier si c'est un nouvel incident
    if (lastIncidentId === null) {
      setLastIncidentId(latestIncident.id);
      return;
    }

    if (latestIncident.id !== lastIncidentId) {
      // Nouvel incident détecté
      const notification = {
        id: Date.now(),
        incident: latestIncident,
        timestamp: new Date(),
      };

      setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
      setLastIncidentId(latestIncident.id);

      // Son de notification (optionnel)
      if (latestIncident.severity === "high") {
        playNotificationSound();
      }

      // Supprimer après 10 secondes
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notification.id)
        );
      }, 10000);
    }
  }, [incidents, lastIncidentId]);

  const playNotificationSound = () => {
    // Créer un son de notification simple
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "high":
        return {
          bg: "from-red-900/90 to-red-950/90",
          border: "border-red-500/50",
          icon: "🚨",
          text: "text-red-400",
        };
      case "medium":
        return {
          bg: "from-yellow-900/90 to-yellow-950/90",
          border: "border-yellow-500/50",
          icon: "⚠️",
          text: "text-yellow-400",
        };
      case "low":
        return {
          bg: "from-green-900/90 to-green-950/90",
          border: "border-green-500/50",
          icon: "ℹ️",
          text: "text-green-400",
        };
      default:
        return {
          bg: "from-slate-900/90 to-slate-950/90",
          border: "border-slate-500/50",
          icon: "📌",
          text: "text-slate-400",
        };
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => {
        const styles = getSeverityStyles(notification.incident.severity);
        return (
          <div
            key={notification.id}
            className={`bg-gradient-to-r ${styles.bg} backdrop-blur-xl border ${styles.border} rounded-xl shadow-2xl p-4 animate-slideInRight`}
          >
            <div className="flex items-start space-x-3">
              {/* Icône */}
              <div className="flex-shrink-0 text-3xl">{styles.icon}</div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-bold ${styles.text} text-sm uppercase tracking-wide`}>
                    Nouvel incident
                  </h4>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <p className="text-slate-200 text-sm mb-2 line-clamp-2">
                  {notification.incident.message}
                </p>

                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <span>🔹</span>
                    <span>{notification.incident.source}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>⏰</span>
                    <span>
                      {notification.timestamp.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mt-3 h-1 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${styles.text.replace("text", "bg")} animate-shrink`}
                style={{
                  animation: "shrink 10s linear",
                }}
              />
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-shrink {
          animation: shrink 10s linear;
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

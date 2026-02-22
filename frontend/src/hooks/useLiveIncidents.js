import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook personnalisé pour récupérer les incidents en temps réel
 * Utilise le polling pour mettre à jour automatiquement
 */
export function useLiveIncidents(options = {}) {
  const {
    endpoint = "http://localhost:8000/v1/incidents/",
    refreshInterval = 5000, // 5 secondes par défaut
    autoRefresh = true,
  } = options;

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLive, setIsLive] = useState(autoRefresh);
  const [newIncidentsCount, setNewIncidentsCount] = useState(0);
  
  const intervalRef = useRef(null);
  const previousIncidentsRef = useRef([]);

  // Fonction pour récupérer les données
  const fetchIncidents = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Détecter les nouveaux incidents
      if (previousIncidentsRef.current.length > 0) {
        const previousIds = new Set(previousIncidentsRef.current.map(inc => inc.id));
        const newIncs = data.filter(inc => !previousIds.has(inc.id));
        setNewIncidentsCount(newIncs.length);
      }

      setIncidents(data);
      previousIncidentsRef.current = data;
      setLastUpdate(new Date());
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des incidents:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [endpoint]);

  // Rafraîchir manuellement
  const refresh = useCallback(() => {
    fetchIncidents(false);
  }, [fetchIncidents]);

  // Toggle live mode
  const toggleLive = useCallback(() => {
    setIsLive(prev => !prev);
  }, []);

  // Setup polling
  useEffect(() => {
    // Première récupération
    fetchIncidents();

    // Setup polling si live activé
    if (isLive) {
      intervalRef.current = setInterval(() => {
        fetchIncidents(true); // Silent refresh
      }, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, refreshInterval, fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    lastUpdate,
    isLive,
    newIncidentsCount,
    refresh,
    toggleLive,
  };
}

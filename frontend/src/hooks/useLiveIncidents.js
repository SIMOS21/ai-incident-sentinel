import { useState, useEffect, useRef, useCallback } from "react";

import { useLive } from "../context/LiveContext";
import { buildApiUrl } from "../services/api";

export function useLiveIncidents(options = {}) {
  const resolvedOptions =
    typeof options === "number" ? { refreshInterval: options } : options;

  const {
    refreshInterval = 5000,
    autoRefresh = true,
  } = resolvedOptions;

  const { isLive, toggleLive } = useLive();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [newIncidentsCount, setNewIncidentsCount] = useState(0);

  const previousIdsRef = useRef(new Set());
  const intervalRef = useRef(null);

  const fetchIncidents = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl("/incidents/"));
      if (!response.ok) throw new Error("Erreur reseau");

      const data = await response.json();

      const currentIds = new Set(data.map((incident) => incident.id));
      const newIds = [...currentIds].filter((id) => !previousIdsRef.current.has(id));

      if (previousIdsRef.current.size > 0 && newIds.length > 0) {
        setNewIncidentsCount(newIds.length);
        setTimeout(() => setNewIncidentsCount(0), 5000);
      }

      previousIdsRef.current = currentIds;
      setIncidents(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    if (!autoRefresh || !isLive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(fetchIncidents, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, isLive, refreshInterval, fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    lastUpdate,
    isLive,
    newIncidentsCount,
    refresh: fetchIncidents,
    toggleLive,
  };
}


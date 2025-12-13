"use client";

import { useEffect, useState } from "react";

export function usePremierLeagueMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/pertandingan");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setMatches(data.matches || []);
        }
      } catch {
        if (!cancelled) {
          setMatches([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const reloadMatches = () => {
    setRefreshToken((prev) => prev + 1);
  };

  return { matches, loadingMatches: loading, reloadMatches };
}

export function usePremierLeagueNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/news");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setNews(data.articles || []);
        }
      } catch {
        if (!cancelled) {
          setNews([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { news, loadingNews: loading };
}

export function usePremierLeagueStandings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/klasemen");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          const tableObj = (data.standings || []).find(
            (s) => s.type === "TOTAL"
          );
          setStandings(Array.isArray(tableObj?.table) ? tableObj.table : []);
        }
      } catch {
        if (!cancelled) {
          setStandings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const reloadStandings = () => {
    setRefreshToken((prev) => prev + 1);
  };

  return { standings, loadingStandings: loading, reloadStandings };
}

export function useChampionsLeagueMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ucl-matches");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setMatches(data.matches || []);
        }
      } catch {
        if (!cancelled) {
          setMatches([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { uclMatches: matches, loadingUclMatches: loading };
}

export function useChampionsLeagueStandings() {
  const [uclStandings, setUclStandings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ucl-standings");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          const list = Array.isArray(data.standings) ? data.standings : [];
          setUclStandings(list);
        }
      } catch {
        if (!cancelled) {
          setUclStandings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const reloadUclStandings = () => {
    setRefreshToken((prev) => prev + 1);
  };

  return {
    uclStandings,
    loadingUclStandings: loading,
    reloadUclStandings,
  };
}

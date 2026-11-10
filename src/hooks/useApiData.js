import { useEffect, useState, useCallback } from "react";
import { axiosAuth } from "../Config/axios";

export const DEMO = process.env.REACT_APP_DEMO === "true";

/**
 * Calls the real endpoint. Real data is NEVER silently replaced by mock data:
 * on failure you get { data: null (or last good data), error } so the UI can show an error/retry state.
 * Placeholder data is used ONLY when REACT_APP_DEMO=true (explicit demo mode).
 * Options: pollMs, params, skip, refreshOn (window event name that triggers a refetch).
 */
export default function useApiData(endpoint, placeholder, { pollMs, params, skip, refreshOn } = {}) {
  const [state, set] = useState({ data: DEMO ? placeholder : null, isLoading: !skip, isPlaceholder: DEMO, error: null });
  const key = JSON.stringify(params || {});
  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("Tkn");
      const r = await axiosAuth().get(endpoint, { params, headers: token ? { Authorization: `Bearer ${token}` } : {}, timeout: 8000 });
      const d = r?.data?.data ?? r?.data;
      set({ data: d, isLoading: false, isPlaceholder: false, error: null });
    } catch (e) {
      set((s) => ({ data: s.data, isLoading: false, isPlaceholder: DEMO && s.isPlaceholder, error: e }));
    }
    // eslint-disable-next-line
  }, [endpoint, key]);
  useEffect(() => { if (skip) return undefined; load(); if (!pollMs) return undefined; const t = setInterval(load, pollMs); return () => clearInterval(t); }, [load, pollMs, skip]);
  useEffect(() => { if (!refreshOn) return undefined; window.addEventListener(refreshOn, load); return () => window.removeEventListener(refreshOn, load); }, [refreshOn, load]);
  return { ...state, refetch: load };
}

import { useEffect, useState, useCallback } from "react";
import { axiosAuth } from "../Config/axios";
/** Calls the real endpoint; on error/empty returns `placeholder` (isPlaceholder=true). Polls if pollMs set. */
export default function useApiData(endpoint, placeholder, { pollMs, params, skip } = {}) {
  const [state, set] = useState({ data: placeholder, isLoading: !skip, isPlaceholder: true, error: null });
  const key = JSON.stringify(params || {});
  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("Tkn");
      const r = await axiosAuth().get(endpoint, { params, headers: token ? { Authorization: `Bearer ${token}` } : {}, timeout: 6000 });
      const d = r?.data?.data ?? r?.data;
      if (d == null || (Array.isArray(d) && !d.length)) throw new Error("empty");
      set({ data: d, isLoading: false, isPlaceholder: false, error: null });
    } catch (e) { set((s) => ({ data: s.isPlaceholder ? placeholder : s.data, isLoading: false, isPlaceholder: s.isPlaceholder, error: e })); }
    // eslint-disable-next-line
  }, [endpoint, key]);
  useEffect(() => { if (skip) return; load(); if (!pollMs) return; const t = setInterval(load, pollMs); return () => clearInterval(t); }, [load, pollMs, skip]);
  return { ...state, refetch: load };
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AREAS, type Horizon } from "./mock-data";

interface AppState {
  horizon: Horizon;
  setHorizon: (h: Horizon) => void;
  areaId: string;
  setAreaId: (id: string) => void;
}

const Ctx = createContext<AppState | null>(null);
const KEY = "yyp-state";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [horizon, setHorizon] = useState<Horizon>("now");
  const [areaId, setAreaId] = useState<string>(AREAS[0]!.id);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (["now", "1h", "3h", "6h"].includes(s.horizon)) setHorizon(s.horizon);
      if (AREAS.some((a) => a.id === s.areaId)) setAreaId(s.areaId);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ horizon, areaId }));
  }, [horizon, areaId]);

  return <Ctx.Provider value={{ horizon, setHorizon, areaId, setAreaId }}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used inside AppStateProvider");
  return v;
}

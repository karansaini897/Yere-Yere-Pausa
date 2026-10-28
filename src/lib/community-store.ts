// DEMO STORE — citizen reports, response statuses and feature suggestions are
// kept in localStorage only. Nothing here is sent to a server, and uploaded
// photos are never stored (only a "photo attached" flag is kept).

import { useEffect, useState } from "react";
import { AREAS, REPORTS, areaById } from "./mock-data";

export type ReportCategory = "waterlogged-road" | "flooded-underpass" | "blocked-drain" | "heavy-accumulation";

export const CATEGORY_LABEL: Record<ReportCategory, string> = {
  "waterlogged-road": "Waterlogged road",
  "flooded-underpass": "Flooded underpass",
  "blocked-drain": "Blocked drain",
  "heavy-accumulation": "Heavy water accumulation",
};

export type ReportStatus = "citizen-reported" | "under-review" | "confirmed" | "resolved";

export const STATUS_LABEL: Record<ReportStatus, string> = {
  "citizen-reported": "Citizen reported",
  "under-review": "Under review",
  confirmed: "Confirmed",
  resolved: "Resolved",
};

export interface CitizenReport {
  id: string;
  areaId: string;
  category: ReportCategory;
  description: string;
  /** ISO timestamp of when the report was made */
  createdAt: string;
  /** True when the reporter attached a photo. The image itself is never stored. */
  hasPhoto: boolean;
  status: ReportStatus;
}

const REPORTS_KEY = "yyp-citizen-reports";
const STATUS_KEY = "yyp-response-statuses";
const SUGGESTIONS_KEY = "yyp-suggestions";

function seedReports(): CitizenReport[] {
  const catFor: Record<string, ReportCategory> = {
    r1: "waterlogged-road",
    r2: "flooded-underpass",
    r3: "heavy-accumulation",
    r4: "blocked-drain",
  };
  const statusFor: Record<string, ReportStatus> = {
    r1: "citizen-reported",
    r2: "confirmed",
    r3: "under-review",
    r4: "citizen-reported",
  };
  return REPORTS.map((r) => {
    const area = AREAS.find((a) => a.name === r.area) ?? AREAS[0]!;
    return {
      id: r.id,
      areaId: area.id,
      category: catFor[r.id] ?? "waterlogged-road",
      description: r.message,
      createdAt: new Date(Date.now() - r.minutesAgo * 60000).toISOString(),
      hasPhoto: false,
      status: statusFor[r.id] ?? "citizen-reported",
    };
  });
}

function readJson<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const v = fallback();
      localStorage.setItem(key, JSON.stringify(v));
      return v;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — ignore in demo */
  }
}

/**
 * Generic localStorage-backed state hook. Starts from the fallback so SSR and
 * the first client render match, then loads stored values after hydration and
 * persists on change.
 */
function useStored<T>(key: string, fallback: () => T) {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setValue(readJson(key, fallback));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (loaded) writeJson(key, value);
  }, [key, value, loaded]);
  return [value, setValue] as const;
}

export function useCitizenReports() {
  const [reports, setReports] = useStored<CitizenReport[]>(REPORTS_KEY, seedReports);
  const addReport = (r: Omit<CitizenReport, "id" | "createdAt" | "status">) => {
    const report: CitizenReport = {
      ...r,
      id: `u-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      status: "citizen-reported",
    };
    setReports((prev) => [report, ...prev]);
    return report;
  };
  return { reports, addReport };
}

// ---------- Duplicate detection (transparent, simple matching) ----------

export const DUPLICATE_WINDOW_MINUTES = 60;

/**
 * A report is a possible duplicate when an existing report has the SAME area
 * and SAME category and was made within the last 60 minutes. Deliberately
 * simple and transparent — no fuzzy or AI matching.
 */
export function findDuplicates(
  candidate: { areaId: string; category: ReportCategory; createdAt: string },
  existing: CitizenReport[],
): CitizenReport[] {
  const t = new Date(candidate.createdAt).getTime();
  const windowMs = DUPLICATE_WINDOW_MINUTES * 60_000;
  return existing.filter(
    (r) =>
      r.areaId === candidate.areaId &&
      r.category === candidate.category &&
      Math.abs(t - new Date(r.createdAt).getTime()) <= windowMs,
  );
}

// ---------- Response dashboard ----------

export type ResponseStatus = "new" | "in-progress" | "resolved";

export const RESPONSE_STATUS_LABEL: Record<ResponseStatus, string> = {
  new: "New",
  "in-progress": "In Progress",
  resolved: "Resolved",
};

export function useResponseStatuses() {
  const [statuses, setStatuses] = useStored<Record<string, ResponseStatus>>(STATUS_KEY, () => ({}));
  const setStatus = (incidentId: string, status: ResponseStatus) =>
    setStatuses((prev) => ({ ...prev, [incidentId]: status }));
  return { statuses, setStatus };
}

/** Suggested response action for an incident — fixed, transparent rules. */
export function suggestedAction(input: { kind: "predicted"; score: number } | { kind: "report"; category: ReportCategory }): string {
  if (input.kind === "report") {
    return {
      "flooded-underpass": "Review road closure requirements",
      "blocked-drain": "Inspect drainage",
      "waterlogged-road": "Place warning signage",
      "heavy-accumulation": "Verify citizen report on-site",
    }[input.category];
  }
  return input.score >= 80 ? "Place warning signage" : "Inspect drainage";
}

// ---------- Feature suggestions ----------

export interface Suggestion {
  id: string;
  title: string;
  problem: string;
  createdAt: string;
}

export function useSuggestions() {
  const [suggestions, setSuggestions] = useStored<Suggestion[]>(SUGGESTIONS_KEY, () => []);
  const addSuggestion = (s: Omit<Suggestion, "id" | "createdAt">) => {
    const item: Suggestion = { ...s, id: `s-${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
    setSuggestions((prev) => [item, ...prev]);
    return item;
  };
  return { suggestions, addSuggestion };
}

export function reportAreaName(r: CitizenReport) {
  return areaById(r.areaId).name;
}

export function formatReportTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

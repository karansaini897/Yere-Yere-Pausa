// DEMO DATA ONLY — simulated values for UI development.
// Not connected to rainfall sensors, official warnings, or any forecasting model.

export type RiskLevel = "low" | "moderate" | "high" | "severe";
export type Horizon = "now" | "1h" | "3h" | "6h";

export const HORIZONS: { id: Horizon; label: string }[] = [
  { id: "now", label: "Now" },
  { id: "1h", label: "+1 hour" },
  { id: "3h", label: "+3 hours" },
  { id: "6h", label: "+6 hours" },
];

export interface Location {
  city: string;
  state: string;
}

export const DEFAULT_LOCATION: Location = { city: "Pune", state: "Maharashtra" };

export interface AreaRisk {
  id: string;
  name: string;
  ward: string;
  /** Position on the schematic preview map, 0–100 */
  x: number;
  y: number;
  /** Simulated risk score 0–100 per horizon */
  scores: Record<Horizon, number>;
  note: string;
}

export interface CommunityReport {
  id: string;
  area: string;
  message: string;
  depth: "ankle" | "knee" | "waist";
  minutesAgo: number;
  confirmations: number;
}

export interface HorizonSummary {
  rainfallMm: number;
  intensity: string;
}

export const DEMO_GENERATED_AT = new Date("2026-10-18T17:30:00+05:30");

export const AREAS: AreaRisk[] = [
  { id: "sinhagad", name: "Sinhagad Road", ward: "Dhayari", x: 30, y: 74, scores: { now: 72, "1h": 81, "3h": 88, "6h": 70 }, note: "Low-lying stretch near nala crossing" },
  { id: "kothrud", name: "Kothrud Depot", ward: "Kothrud", x: 22, y: 50, scores: { now: 45, "1h": 58, "3h": 66, "6h": 52 }, note: "Drain inlet blockage reported earlier" },
  { id: "hadapsar", name: "Hadapsar Gadital", ward: "Hadapsar", x: 78, y: 62, scores: { now: 64, "1h": 70, "3h": 77, "6h": 61 }, note: "Underpass prone to pooling" },
  { id: "shivajinagar", name: "Shivajinagar", ward: "Shivajinagar", x: 46, y: 36, scores: { now: 38, "1h": 44, "3h": 52, "6h": 40 }, note: "Moderate runoff near bus stand" },
  { id: "viman", name: "Viman Nagar", ward: "Nagar Road", x: 74, y: 26, scores: { now: 28, "1h": 35, "3h": 47, "6h": 33 }, note: "Generally drains well" },
  { id: "katraj", name: "Katraj Chowk", ward: "Katraj", x: 52, y: 86, scores: { now: 55, "1h": 67, "3h": 84, "6h": 75 }, note: "Hill runoff collects at junction" },
  { id: "baner", name: "Baner Road", ward: "Aundh-Baner", x: 26, y: 20, scores: { now: 22, "1h": 30, "3h": 41, "6h": 29 }, note: "Construction debris near drains" },
];

export const HORIZON_SUMMARY: Record<Horizon, HorizonSummary> = {
  now: { rainfallMm: 12, intensity: "Moderate" },
  "1h": { rainfallMm: 18, intensity: "Heavy" },
  "3h": { rainfallMm: 31, intensity: "Very heavy" },
  "6h": { rainfallMm: 14, intensity: "Moderate" },
};

export const REPORTS: CommunityReport[] = [
  { id: "r1", area: "Sinhagad Road", message: "Water up to the ankle near Anand Nagar signal, two-wheelers slowing down.", depth: "ankle", minutesAgo: 8, confirmations: 6 },
  { id: "r2", area: "Hadapsar Gadital", message: "Underpass has knee-deep water, autos avoiding it.", depth: "knee", minutesAgo: 21, confirmations: 11 },
  { id: "r3", area: "Katraj Chowk", message: "Heavy flow from hill side, footpath covered.", depth: "ankle", minutesAgo: 34, confirmations: 3 },
  { id: "r4", area: "Kothrud Depot", message: "Drain near depot overflowing slightly.", depth: "ankle", minutesAgo: 52, confirmations: 2 },
];

export function riskLevel(score: number): RiskLevel {
  if (score >= 80) return "severe";
  if (score >= 60) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  severe: "Severe",
};

export function horizonTime(h: Horizon, base = DEMO_GENERATED_AT): Date {
  const add = { now: 0, "1h": 1, "3h": 3, "6h": 6 }[h];
  return new Date(base.getTime() + add * 3600_000);
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

export function overviewStats(h: Horizon) {
  const sorted = [...AREAS].sort((a, b) => b.scores[h] - a.scores[h]);
  const avg = Math.round(AREAS.reduce((s, a) => s + a.scores[h], 0) / AREAS.length);
  const highCount = AREAS.filter((a) => a.scores[h] >= 60).length;
  return { sorted, avg, level: riskLevel(avg), highCount, activeReports: REPORTS.length, ...HORIZON_SUMMARY[h] };
}

// ---------- Extended demo data (map, factors, routes, timeline) ----------

export const PUNE_CENTER: [number, number] = [18.515, 73.856];

/** Approximate public landmark coordinates for demo markers (not surveyed geometry). */
export const AREA_COORDS: Record<string, [number, number]> = {
  sinhagad: [18.4795, 73.8205],
  kothrud: [18.5035, 73.8075],
  hadapsar: [18.5025, 73.9265],
  shivajinagar: [18.5308, 73.8475],
  viman: [18.5679, 73.9143],
  katraj: [18.4575, 73.8585],
  baner: [18.559, 73.7868],
};

export type FactorKey = "rainfall" | "terrain" | "drainage" | "history" | "reports";
export const FACTOR_LABEL: Record<FactorKey, string> = {
  rainfall: "Recent or forecast rainfall",
  terrain: "Low-lying terrain",
  drainage: "Drainage limitations",
  history: "Historical waterlogging incidents",
  reports: "Recent community reports",
};

/** Illustrative factor weights 0–1 per area (hand-authored, not model output). */
export const AREA_FACTORS: Record<string, Partial<Record<FactorKey, number>>> = {
  sinhagad: { rainfall: 0.8, terrain: 0.9, drainage: 0.6, history: 0.8, reports: 0.7 },
  kothrud: { rainfall: 0.7, drainage: 0.8, history: 0.4, reports: 0.3 },
  hadapsar: { rainfall: 0.7, terrain: 0.8, drainage: 0.7, history: 0.7, reports: 0.9 },
  shivajinagar: { rainfall: 0.6, drainage: 0.5, history: 0.3 },
  viman: { rainfall: 0.5, drainage: 0.3, history: 0.2 },
  katraj: { rainfall: 0.8, terrain: 0.7, history: 0.6, reports: 0.5 },
  baner: { rainfall: 0.5, drainage: 0.6, history: 0.2 },
};

/** Confidence drops for longer horizons — illustrative only. */
export function confidence(h: Horizon): number {
  return { now: 70, "1h": 62, "3h": 50, "6h": 38 }[h];
}

export function factorsFor(id: string, h: Horizon) {
  const f = AREA_FACTORS[id] ?? {};
  const rainBoost = HORIZON_SUMMARY[h].rainfallMm / 31;
  return (Object.keys(f) as FactorKey[])
    .map((k) => ({ key: k, label: FACTOR_LABEL[k], weight: Math.min(1, k === "rainfall" ? (f[k] ?? 0) * (0.6 + rainBoost * 0.5) : f[k] ?? 0) }))
    .sort((a, b) => b.weight - a.weight);
}

export function areaById(id: string) {
  return (AREAS.find((a) => a.id === id) ?? AREAS[0])!;
}

// Rain timeline: 12 hourly simulated points per area
export interface TimelinePoint { time: string; iso: string; rainfall: number; risk: number }
const RAIN_CURVE = [8, 10, 12, 15, 18, 24, 31, 28, 20, 14, 10, 7];
export function timelineFor(id: string, hours = 12): TimelinePoint[] {
  const a = areaById(id);
  const base = a.scores.now;
  const peak = a.scores["3h"];
  return RAIN_CURVE.slice(0, hours).map((r, i) => {
    const t = new Date(DEMO_GENERATED_AT.getTime() + i * 3600_000);
    const shape = RAIN_CURVE[i]! / 31;
    const risk = Math.round(Math.min(100, Math.max(5, base * 0.6 + (peak - base * 0.6) * shape)));
    const rainfall = Math.round(r * (0.7 + (AREA_FACTORS[a.id]?.rainfall ?? 0.5) * 0.5));
    return { time: formatTime(t), iso: t.toISOString(), rainfall, risk };
  });
}

// Demo trip planner
export type TravelMode = "walk" | "two-wheeler" | "car";
export const MODES: { id: TravelMode; label: string; kmh: number; sensitivity: number }[] = [
  { id: "walk", label: "Walking", kmh: 4.5, sensitivity: 1.2 },
  { id: "two-wheeler", label: "Two-wheeler", kmh: 22, sensitivity: 1.1 },
  { id: "car", label: "Car", kmh: 18, sensitivity: 0.85 },
];

export const PLACES = [
  { id: "swargate", name: "Swargate", coord: [18.5018, 73.8636] as [number, number] },
  { id: "pune-stn", name: "Pune Railway Station", coord: [18.5286, 73.8743] as [number, number] },
  { id: "fc", name: "FC Road", coord: [18.5236, 73.8411] as [number, number] },
  { id: "kothrud-p", name: "Kothrud", coord: [18.5074, 73.8077] as [number, number] },
  { id: "hadapsar-p", name: "Hadapsar", coord: [18.5089, 73.926] as [number, number] },
  { id: "katraj-p", name: "Katraj", coord: [18.4529, 73.8652] as [number, number] },
  { id: "airport", name: "Pune Airport", coord: [18.5793, 73.9089] as [number, number] },
  { id: "dhayari", name: "Dhayari", coord: [18.4473, 73.8095] as [number, number] },
];

export interface DemoRoute {
  id: string;
  name: string;
  points: [number, number][];
  km: number;
  minutes: number;
  exposure: number;
  segments: { label: string; areaId?: string; level: RiskLevel; score: number }[];
}

function distKm(a: [number, number], b: [number, number]) {
  const dx = (a[1] - b[1]) * 105.6, dy = (a[0] - b[0]) * 111;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Builds simple demo routes by detouring via nearby demo areas. Not real road routing. */
export function demoRoutes(originId: string, destId: string, mode: TravelMode, h: Horizon): DemoRoute[] {
  const o = PLACES.find((p) => p.id === originId), d = PLACES.find((p) => p.id === destId);
  if (!o || !d || o.id === d.id) return [];
  const m = MODES.find((x) => x.id === mode)!;
  const mid: [number, number] = [(o.coord[0] + d.coord[0]) / 2, (o.coord[1] + d.coord[1]) / 2];
  const byNear = [...AREAS].sort((a, b) => distKm(AREA_COORDS[a.id]!, mid) - distKm(AREA_COORDS[b.id]!, mid));
  const candidates = [
    { id: "direct", name: "Most direct", via: [] as typeof AREAS },
    { id: "via-a", name: `Via ${byNear[0]!.name}`, via: [byNear[0]!] },
    { id: "via-b", name: `Via ${byNear[1]!.name}`, via: [byNear[1]!] },
  ];
  return candidates.map((c, idx) => {
    const pts: [number, number][] = [o.coord, ...c.via.map((a) => AREA_COORDS[a.id]!), d.coord];
    if (c.via.length === 0) {
      // slight bend so the line doesn't overlap others
      pts.splice(1, 0, [mid[0] + 0.004, mid[1] - 0.004]);
    }
    let km = 0;
    for (let i = 1; i < pts.length; i++) km += distKm(pts[i - 1]!, pts[i]!);
    km = km * 1.25;
    // Segments: each area within ~1.8km of any route point counts as touched
    const touched = AREAS.filter((a) => pts.some((p) => distKm(p, AREA_COORDS[a.id]!) < 1.8));
    const segments = [
      { label: `${o.name} start`, level: "low" as RiskLevel, score: 20 },
      ...touched.map((a) => ({ label: a.name, areaId: a.id, level: riskLevel(a.scores[h]), score: a.scores[h] })),
      { label: `${d.name} arrival`, level: "low" as RiskLevel, score: 20 },
    ];
    const maxTouched = touched.length ? Math.max(...touched.map((a) => a.scores[h])) : 25;
    const avgTouched = touched.length ? touched.reduce((s, a) => s + a.scores[h], 0) / touched.length : 25;
    const exposure = Math.round(Math.min(100, (maxTouched * 0.6 + avgTouched * 0.4) * m.sensitivity * (idx === 0 ? 1 : 0.97)));
    return { id: c.id, name: c.name, points: pts, km: Math.round(km * 10) / 10, minutes: Math.round((km / m.kmh) * 60), exposure, segments };
  });
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BellOff, BellPlus, Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AreaSelect } from "@/components/app/area-select";
import { DemoBadge, EmptyState, PageHeader, RiskBadge } from "@/components/app/ui-bits";
import { useAppState } from "@/lib/app-state";
import { AREAS, DEMO_GENERATED_AT, HORIZONS, RISK_LABEL, areaById, formatTime, horizonTime, riskLevel, type Horizon, type RiskLevel } from "@/lib/mock-data";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Neighbourhood Alerts — Yere Yere Pausa" },
      { name: "description", content: "Choose a Pune area, risk levels and forecast windows to see in-app demo waterlogging alerts." },
      { property: "og:title", content: "Neighbourhood Alerts — Yere Yere Pausa" },
      { property: "og:description", content: "In-app demo waterlogging alerts for your neighbourhood." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Alerts,
});

interface DemoAlert { id: string; areaId: string; horizon: Horizon; score: number; at: Date }

function Alerts() {
  const { areaId } = useAppState();
  const [levels, setLevels] = useState<RiskLevel[]>(["high", "severe"]);
  const [windows, setWindows] = useState<Horizon[]>(["now", "1h", "3h"]);
  const [extra, setExtra] = useState<DemoAlert[]>([]);
  const [cleared, setCleared] = useState(false);

  const generated = useMemo<DemoAlert[]>(
    () =>
      windows
        .map((h) => ({ id: `${areaId}-${h}`, areaId, horizon: h, score: areaById(areaId).scores[h], at: DEMO_GENERATED_AT }))
        .filter((a) => levels.includes(riskLevel(a.score))),
    [areaId, levels, windows],
  );
  const list = [...extra.filter((a) => a.areaId === areaId), ...(cleared ? [] : generated)];

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const simulate = () => {
    const area = areaById(areaId);
    const h = windows[0] ?? "now";
    const bump = Math.min(100, area.scores[h] + 5 + extra.length * 3);
    setExtra((p) => [{ id: `sim-${Date.now()}`, areaId, horizon: h, score: bump, at: new Date() }, ...p]);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Neighbourhood Alerts" subtitle="Set what you care about and see matching in-app alerts." actions={<DemoBadge />} />
      <div className="flex gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
        <Info className="h-4 w-4 shrink-0 translate-y-0.5" aria-hidden />
        <p>These are in-app demo notifications only. No SMS, email or push notifications are sent, and they are not official warnings.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="space-y-5 rounded-2xl border bg-card p-4 sm:p-5">
          <AreaSelect label="Neighbourhood" />
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Alert me for risk levels</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["low", "moderate", "high", "severe"] as RiskLevel[]).map((l) => (
                <Label key={l} className="flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 font-normal">
                  <Checkbox checked={levels.includes(l)} onCheckedChange={() => { setLevels((p) => toggle(p, l)); setCleared(false); }} />
                  {RISK_LABEL[l]}
                </Label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Forecast windows</legend>
            <div className="grid grid-cols-2 gap-2">
              {HORIZONS.map((h) => (
                <Label key={h.id} className="flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 font-normal">
                  <Checkbox checked={windows.includes(h.id)} onCheckedChange={() => { setWindows((p) => toggle(p, h.id)); setCleared(false); }} />
                  {h.label}
                </Label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <Button onClick={simulate} disabled={windows.length === 0}><BellPlus className="h-4 w-4" /> Simulate new alert</Button>
            <Button variant="outline" onClick={() => { setExtra([]); setCleared(true); }}><Trash2 className="h-4 w-4" /> Clear</Button>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">Alerts for {areaById(areaId).name}</h2>
            <DemoBadge />
          </div>
          {list.length === 0 ? (
            <EmptyState icon={BellOff} title="No matching alerts" body="Nothing in your selected risk levels and windows. Try adding more levels or windows." />
          ) : (
            <ul className="space-y-3">
              {list.map((a) => {
                const area = AREAS.find((x) => x.id === a.areaId)!;
                const lvl = riskLevel(a.score);
                return (
                  <li key={a.id} className="rounded-xl border bg-background p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{RISK_LABEL[lvl]} waterlogging risk · {area.name}</p>
                      <RiskBadge level={lvl} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Simulated score {a.score}/100 for {HORIZONS.find((h) => h.id === a.horizon)?.label} (around {formatTime(horizonTime(a.horizon))} IST). {area.note}.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">Issued {formatTime(a.at)} IST · demo notification</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

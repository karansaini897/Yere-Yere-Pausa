import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DEMO_GENERATED_AT, HORIZONS, areaById, confidence, factorsFor, formatTime, horizonTime, riskLevel, type Horizon } from "@/lib/mock-data";
import { DemoBadge, RiskBadge } from "./ui-bits";

export function RiskDetails({ areaId, horizon, onClose }: { areaId: string; horizon: Horizon; onClose?: () => void }) {
  const a = areaById(areaId);
  const score = a.scores[horizon];
  const hLabel = HORIZONS.find((h) => h.id === horizon)?.label;
  const factors = factorsFor(a.id, horizon);
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-semibold">{a.name}</h2>
          <p className="text-sm text-muted-foreground">{a.ward} ward · {a.note}</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RiskBadge level={riskLevel(score)} />
        <DemoBadge />
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted p-3"><dt className="text-xs text-muted-foreground">Risk score</dt><dd className="font-display text-lg font-bold">{score}/100</dd></div>
        <div className="rounded-lg bg-muted p-3"><dt className="text-xs text-muted-foreground">Forecast window</dt><dd className="font-semibold">{hLabel} · {formatTime(horizonTime(horizon))}</dd></div>
        <div className="rounded-lg bg-muted p-3"><dt className="text-xs text-muted-foreground">Confidence (illustrative)</dt><dd className="font-semibold">~{confidence(horizon)}%</dd></div>
        <div className="rounded-lg bg-muted p-3"><dt className="text-xs text-muted-foreground">Last updated</dt><dd className="font-semibold">{formatTime(DEMO_GENERATED_AT)} IST</dd></div>
      </dl>
      <section aria-labelledby="why">
        <h3 id="why" className="font-semibold">Why this risk?</h3>
        <ul className="mt-2 space-y-2.5">
          {factors.map((f) => (
            <li key={f.key}>
              <div className="flex justify-between text-sm"><span>{f.label}</span><span className="tabular-nums text-muted-foreground">{Math.round(f.weight * 100)}%</span></div>
              <Progress value={f.weight * 100} className="mt-1 h-1.5" aria-label={`${f.label} contribution`} />
            </li>
          ))}
        </ul>
        <p className="mt-3 flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs">
          <Info className="h-4 w-4 shrink-0" aria-hidden />
          These are illustrative factors written for this prototype. They are not output from a validated prediction model and are not proof of actual conditions.
        </p>
      </section>
    </div>
  );
}

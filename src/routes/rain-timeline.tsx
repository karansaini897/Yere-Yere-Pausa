import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { AreaSelect } from "@/components/app/area-select";
import { DemoBadge, PageHeader, RiskBadge } from "@/components/app/ui-bits";
import { useAppState } from "@/lib/app-state";
import { DEMO_GENERATED_AT, areaById, formatTime, riskLevel, timelineFor } from "@/lib/mock-data";

export const Route = createFileRoute("/rain-timeline")({
  head: () => ({
    meta: [
      { title: "Rain Timeline — Yere Yere Pausa" },
      { name: "description", content: "Hourly simulated rainfall and waterlogging risk timeline for sample Pune areas." },
      { property: "og:title", content: "Rain Timeline — Yere Yere Pausa" },
      { property: "og:description", content: "Hour-by-hour simulated rainfall and risk outlook." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RainTimeline,
});

const WINDOWS = [3, 6, 12] as const;

function RainTimeline() {
  const { areaId } = useAppState();
  const [hours, setHours] = useState<number>(12);
  const data = timelineFor(areaId, hours);
  const area = areaById(areaId);
  const peak = data.reduce((m, p) => (p.risk > m.risk ? p : m), data[0]!);
  const total = data.reduce((s, p) => s + p.rainfall, 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Rain Timeline" subtitle={`Hourly simulated outlook for ${area.name} · generated ${formatTime(DEMO_GENERATED_AT)} IST`} actions={<DemoBadge />} />
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border bg-card p-4">
        <AreaSelect />
        <div>
          <Label className="mb-1.5 block">Time window</Label>
          <ToggleGroup type="single" value={String(hours)} onValueChange={(v) => v && setHours(Number(v))} className="rounded-xl border bg-muted p-1">
            {WINDOWS.map((w) => (
              <ToggleGroupItem key={w} value={String(w)} className="rounded-lg px-3 data-[state=on]:bg-card data-[state=on]:shadow-sm">Next {w}h</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Peak simulated risk" value={<span className="flex items-center gap-2">{peak.risk} <RiskBadge level={riskLevel(peak.risk)} /></span>} hint={`at ${peak.time} IST`} />
        <Stat label="Total simulated rainfall" value={`${total} mm`} hint={`over ${hours} hours`} />
        <Stat label="Heaviest hour" value={`${Math.max(...data.map((d) => d.rainfall))} mm/h`} hint={data.find((d) => d.rainfall === Math.max(...data.map((x) => x.rainfall)))?.time + " IST"} />
      </div>

      <section className="rounded-2xl border bg-card p-4 sm:p-5">
        <h2 className="mb-3 font-display text-lg font-semibold">Rainfall and risk</h2>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis yAxisId="r" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} unit="mm" />
              <YAxis yAxisId="k" orientation="right" domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }}
                formatter={(v: number, n: string) => (n === "rainfall" ? [`${v} mm/h`, "Rainfall (demo)"] : [`${v}/100 · ${riskLevel(v)}`, "Risk (demo)"])}
                labelFormatter={(l) => `${l} IST · simulated`}
              />
              <Legend formatter={(v) => (v === "rainfall" ? "Rainfall mm/h" : "Risk score")} />
              <Bar yAxisId="r" dataKey="rainfall" fill="var(--rain)" radius={[6, 6, 0, 0]} />
              <Line yAxisId="k" dataKey="risk" stroke="var(--warning)" strokeWidth={3} dot={{ r: 3 }} type="monotone" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4 sm:p-5">
        <h2 className="mb-2 font-display text-lg font-semibold">Hourly readings</h2>
        <ul className="divide-y text-sm">
          {data.map((d) => (
            <li key={d.iso} className="flex items-center justify-between gap-2 py-2">
              <span className="tabular-nums">{d.time} IST</span>
              <span className="tabular-nums text-muted-foreground">{d.rainfall} mm/h</span>
              <RiskBadge level={riskLevel(d.risk)} />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">All readings are simulated. No rain gauges or weather service are connected.</p>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

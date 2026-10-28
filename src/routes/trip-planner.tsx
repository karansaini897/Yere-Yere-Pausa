import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRightLeft, Bike, Car, Footprints, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HorizonPicker } from "@/components/app/horizon-picker";
import { RiskLeafletMap } from "@/components/app/lazy-map";
import { DemoBadge, EmptyState, PageHeader, RiskBadge } from "@/components/app/ui-bits";
import { useAppState } from "@/lib/app-state";
import { PLACES, demoRoutes, riskLevel, type TravelMode } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trip-planner")({
  head: () => ({
    meta: [
      { title: "Safer Trip Planner — Yere Yere Pausa" },
      { name: "description", content: "Compare demo routes in Pune by simulated waterlogging exposure. No route is guaranteed safe." },
      { property: "og:title", content: "Safer Trip Planner — Yere Yere Pausa" },
      { property: "og:description", content: "Compare demo routes by simulated waterlogging exposure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TripPlanner,
});

const MODE_ICONS = { walk: Footprints, "two-wheeler": Bike, car: Car };
const MODE_LABEL = { walk: "Walking", "two-wheeler": "Two-wheeler", car: "Car" };

function TripPlanner() {
  const { horizon } = useAppState();
  const [origin, setOrigin] = useState("dhayari");
  const [dest, setDest] = useState("pune-stn");
  const [mode, setMode] = useState<TravelMode>("two-wheeler");
  const routes = useMemo(() => demoRoutes(origin, dest, mode, horizon), [origin, dest, mode, horizon]);
  const [picked, setPicked] = useState<string | null>(null);
  const lowest = routes.length ? [...routes].sort((a, b) => a.exposure - b.exposure)[0]!.id : undefined;
  const activeId = routes.some((r) => r.id === picked) ? picked! : lowest;
  const active = routes.find((r) => r.id === activeId);

  return (
    <div className="space-y-5">
      <PageHeader title="Safer Trip Planner" subtitle="Compare demo routes by simulated waterlogging exposure." actions={<DemoBadge />} />

      <div className="flex gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
        <Info className="h-4 w-4 shrink-0 translate-y-0.5" aria-hidden />
        <p>Routing and risk estimates are simulated — no routing service is connected. Lines are rough demo paths, not real roads. No route is ever guaranteed safe; check official local alerts before travelling.</p>
      </div>

      <section className="grid gap-4 rounded-2xl border bg-card p-4 sm:p-5 md:grid-cols-[1fr_auto_1fr]">
        <PlaceSelect id="origin" label="From" value={origin} onChange={setOrigin} />
        <Button variant="outline" size="icon" className="self-end justify-self-center" aria-label="Swap origin and destination" onClick={() => { setOrigin(dest); setDest(origin); }}>
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <PlaceSelect id="dest" label="To" value={dest} onChange={setDest} />
        <div className="flex flex-col gap-3 md:col-span-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Label className="mb-1.5 block">Travel mode</Label>
            <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as TravelMode)} className="rounded-xl border bg-muted p-1">
              {(Object.keys(MODE_ICONS) as TravelMode[]).map((m) => {
                const I = MODE_ICONS[m];
                return (
                  <ToggleGroupItem key={m} value={m} className="gap-1.5 rounded-lg px-3 data-[state=on]:bg-card data-[state=on]:shadow-sm">
                    <I className="h-4 w-4" /> {MODE_LABEL[m]}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>
          <div>
            <Label className="mb-1.5 block">Departure</Label>
            <HorizonPicker />
          </div>
        </div>
      </section>

      {routes.length === 0 ? (
        <EmptyState icon={ArrowRightLeft} title="Pick two different places" body="Origin and destination must be different to compare routes." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <RiskLeafletMap horizon={horizon} routes={routes} activeRouteId={activeId} heightClass="h-[52vh] min-h-[340px]" />
          <div className="space-y-3">
            {routes.map((r) => {
              const lvl = riskLevel(r.exposure);
              const flagged = r.segments.filter((s) => s.level === "high" || s.level === "severe");
              return (
                <button
                  key={r.id}
                  onClick={() => setPicked(r.id)}
                  aria-pressed={r.id === activeId}
                  className={cn("w-full rounded-2xl border bg-card p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", r.id === activeId && "border-primary ring-1 ring-primary")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{r.name}</p>
                    {r.id === lowest && <span className="shrink-0 rounded-full bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary">Lowest estimated exposure</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">~{r.km} km · ~{r.minutes} min ({MODE_LABEL[mode]})</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">Exposure estimate: <RiskBadge level={lvl} /> <span className="tabular-nums text-muted-foreground">{r.exposure}/100</span></div>
                  {flagged.length > 0 && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-danger"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Passes near: {flagged.map((f) => f.label).join(", ")}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {active && (
        <section className="rounded-2xl border bg-card p-4 sm:p-5">
          <h2 className="font-display text-lg font-semibold">Segments on “{active.name}”</h2>
          <ol className="mt-3 space-y-2">
            {active.segments.map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                <span className="min-w-0 truncate">{i + 1}. {s.label}</span>
                <RiskBadge level={s.level} />
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">Even the lowest-exposure route can still flood. Avoid driving or walking through standing water and follow official advisories.</p>
        </section>
      )}
    </div>
  );
}

function PlaceSelect({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {PLACES.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

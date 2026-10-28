import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CloudRain, Clock, MapPin, MessagesSquare, ShieldAlert, Users } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { HorizonPicker } from "@/components/app/horizon-picker";
import { Button } from "@/components/ui/button";
import { DemoBadge, EmptyState, RiskBadge, StatCard } from "@/components/app/ui-bits";
import { RiskMapPreview } from "@/components/app/risk-map-preview";
import {
  DEFAULT_LOCATION, DEMO_GENERATED_AT, HORIZONS, REPORTS, RISK_LABEL,
  formatTime, horizonTime, overviewStats, riskLevel,
} from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — Yere Yere Pausa" },
      { name: "description", content: "Waterlogging risk overview for Pune: risk summary, forecast horizons, at-risk areas and community reports." },
      { property: "og:title", content: "Overview — Yere Yere Pausa" },
      { property: "og:description", content: "Know the risk. Plan ahead. Stay safe. Urban monsoon waterlogging early-warning dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Overview() {
  const { horizon } = useAppState();
  const s = overviewStats(horizon);
  const at = formatTime(horizonTime(horizon));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="bg-hero-rain relative overflow-hidden rounded-2xl border border-sidebar-border p-6 text-sidebar-accent-foreground sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1 text-xs font-medium">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {DEFAULT_LOCATION.city}, {DEFAULT_LOCATION.state}
          </span>
          <DemoBadge className="bg-background/20 text-inherit" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl" suppressHydrationWarning>{greeting()}, Pune</h1>
        <p className="mt-2 max-w-xl text-base opacity-90">Know the risk. Plan ahead. Stay safe.</p>
        <p className="mt-1 text-sm opacity-75" lang="mr">पाऊस येण्याआधी, तयारी आपल्या हाती.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <HorizonPicker variant="onDark" />
          <p className="flex items-center gap-1.5 text-xs opacity-80">
            <Clock className="h-3.5 w-3.5" aria-hidden /> Simulated reading for {at} IST · generated {formatTime(DEMO_GENERATED_AT)}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-label="Summary">
        <StatCard icon={ShieldAlert} tone={s.level === "low" ? "primary" : s.level === "moderate" ? "rain" : "warning"} label="Current risk" value={RISK_LABEL[s.level]} hint={`City index ${s.avg}/100`} />
        <StatCard icon={CloudRain} tone="rain" label="Rainfall" value={<>{s.rainfallMm}<span className="text-base font-medium text-muted-foreground"> mm/h</span></>} hint={s.intensity} />
        <StatCard icon={Users} tone="primary" label="Community reports" value={s.activeReports} hint="Active in last hour" />
        <StatCard icon={AlertTriangle} tone="danger" label="High-risk locations" value={s.highCount} hint="Score 60 and above" />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map preview */}
        <section className="rounded-2xl border bg-card p-4 sm:p-5 lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold">Waterlogging risk preview</h2>
              <p className="text-xs text-muted-foreground">Schematic view · {HORIZONS.find((h) => h.id === horizon)?.label} · {at} IST</p>
            </div>
            <DemoBadge />
          </div>
          <RiskMapPreview horizon={horizon} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(["low", "moderate", "high", "severe"] as const).map((l) => <RiskBadge key={l} level={l} />)}
            </div>
            <Button asChild>
              <Link to="/risk-map">View Risk Map <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        {/* At-risk areas */}
        <section className="rounded-2xl border bg-card p-4 sm:p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">At-risk areas</h2>
            <DemoBadge />
          </div>
          {s.sorted.length === 0 ? (
            <EmptyState icon={MapPin} title="No areas flagged" body="No simulated risk data for this horizon." />
          ) : (
            <ul className="divide-y">
              {s.sorted.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.note}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs tabular-nums text-muted-foreground">{a.scores[horizon]}</span>
                    <RiskBadge level={riskLevel(a.scores[horizon])} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Reports */}
      <section className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold">Recent community reports</h2>
            <DemoBadge />
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/community">Open Community Board</Link>
          </Button>
        </div>
        {REPORTS.length === 0 ? (
          <EmptyState icon={MessagesSquare} title="No reports yet" body="Community reports will appear here." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {REPORTS.map((r) => (
              <article key={r.id} className="rounded-xl border bg-background p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold">{r.area}</p>
                  <span className="shrink-0 rounded-full bg-rain/15 px-2 py-0.5 text-xs font-medium capitalize">{r.depth}-deep</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.message}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatTime(new Date(DEMO_GENERATED_AT.getTime() - r.minutesAgo * 60000))} IST · {r.minutesAgo} min ago · {r.confirmations} confirmations
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-xs text-muted-foreground">
        All figures above are simulated for demonstration. This app is not connected to live sensors, official warnings or a forecasting model, and no route or area is guaranteed safe.
      </p>
    </div>
  );
}

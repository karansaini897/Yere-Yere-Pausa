import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ClipboardList, Filter, Loader, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoBadge, EmptyState, PageHeader, RiskBadge, StatCard } from "@/components/app/ui-bits";
import { useAppState } from "@/lib/app-state";
import { AREAS, riskLevel, type RiskLevel } from "@/lib/mock-data";
import {
  CATEGORY_LABEL,
  RESPONSE_STATUS_LABEL,
  STATUS_LABEL,
  formatReportTime,
  reportAreaName,
  suggestedAction,
  useCitizenReports,
  useResponseStatuses,
  type ResponseStatus,
} from "@/lib/community-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/response")({
  head: () => ({
    meta: [
      { title: "Response Dashboard — Yere Yere Pausa" },
      { name: "description", content: "Prototype dashboard for volunteers and civic responders: prioritised incidents and status tracking." },
      { property: "og:title", content: "Response Dashboard — Yere Yere Pausa" },
      { property: "og:description", content: "Prototype dashboard for volunteers and civic responders: prioritised incidents and status tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResponsePage,
});

interface Incident {
  id: string;
  areaId: string;
  areaName: string;
  kind: "predicted" | "report";
  title: string;
  detail: string;
  score: number;
  level: RiskLevel;
  time: string;
  sourceLabel: string;
  action: string;
}

const responseStatusStyles: Record<ResponseStatus, string> = {
  new: "bg-rain/15 text-foreground border-rain/40",
  "in-progress": "bg-warning/20 text-foreground border-warning/50",
  resolved: "bg-safe/15 text-foreground border-safe/40",
};

function ResponsePage() {
  const { horizon } = useAppState();
  const { reports } = useCitizenReports();
  const { statuses, setStatus } = useResponseStatuses();

  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ResponseStatus>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");

  const incidents = useMemo<Incident[]>(() => {
    const fromAreas: Incident[] = AREAS.filter((a) => a.scores[horizon] >= 60).map((a) => ({
      id: `pred-${a.id}`,
      areaId: a.id,
      areaName: a.name,
      kind: "predicted",
      title: "Predicted high waterlogging risk",
      detail: a.note,
      score: a.scores[horizon],
      level: riskLevel(a.scores[horizon]),
      time: "Simulated forecast",
      sourceLabel: "Predicted risk",
      action: suggestedAction({ kind: "predicted", score: a.scores[horizon] }),
    }));
    const fromReports: Incident[] = reports.map((r) => {
      const area = AREAS.find((a) => a.id === r.areaId) ?? AREAS[0]!;
      const score = area.scores[horizon];
      return {
        id: `rep-${r.id}`,
        areaId: r.areaId,
        areaName: reportAreaName(r),
        kind: "report",
        title: CATEGORY_LABEL[r.category],
        detail: r.description,
        score,
        level: riskLevel(score),
        time: `${formatReportTime(r.createdAt)} IST`,
        sourceLabel: STATUS_LABEL[r.status],
        action: suggestedAction({ kind: "report", category: r.category }),
      };
    });
    return [...fromReports, ...fromAreas];
  }, [reports, horizon]);

  const statusOf = (i: Incident): ResponseStatus =>
    statuses[i.id] ?? (i.kind === "report" && i.sourceLabel === "Resolved" ? "resolved" : "new");

  const filtered = useMemo(() => {
    const rank = (s: ResponseStatus) => (s === "new" ? 0 : s === "in-progress" ? 1 : 2);
    return incidents
      .filter((i) => riskFilter === "all" || i.level === riskFilter)
      .filter((i) => statusFilter === "all" || statusOf(i) === statusFilter)
      .filter((i) => areaFilter === "all" || i.areaId === areaFilter)
      .sort((a, b) => rank(statusOf(a)) - rank(statusOf(b)) || b.score - a.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents, riskFilter, statusFilter, areaFilter, statuses]);

  const highCount = incidents.filter((i) => i.level === "high" || i.level === "severe").length;
  const unresolved = incidents.filter((i) => statusOf(i) !== "resolved").length;
  const inProgress = incidents.filter((i) => statusOf(i) === "in-progress").length;
  const resolved = incidents.filter((i) => statusOf(i) === "resolved").length;

  function updateStatus(i: Incident, s: ResponseStatus) {
    setStatus(i.id, s);
    toast.success(`Marked “${i.areaName} — ${i.title}” as ${RESPONSE_STATUS_LABEL[s]}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Response Dashboard"
        subtitle={
          <>
            Prototype for volunteers and civic responders — not connected to any municipal authority.{" "}
            <DemoBadge className="ml-1" />
          </>
        }
      />

      <div role="note" className="flex items-start gap-2 rounded-xl border border-warning/50 bg-warning/15 p-3 text-sm">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          This is a demonstration prototype. Incidents combine simulated risk predictions with demo citizen reports stored in
          this browser. It does not dispatch real crews and is not linked to PMC, disaster management, or emergency services.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-label="Response summary">
        <StatCard icon={AlertTriangle} tone="danger" label="High / severe risk" value={highCount} hint="Areas and reports at score 60+" />
        <StatCard icon={ClipboardList} tone="warning" label="Unresolved" value={unresolved} hint="New or in progress" />
        <StatCard icon={Loader} tone="rain" label="In progress" value={inProgress} hint="Being handled" />
        <StatCard icon={ShieldCheck} tone="primary" label="Resolved" value={resolved} hint="Marked done" />
      </section>

      {/* Filters */}
      <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-label="Filters">
        <div className="flex flex-wrap items-end gap-3">
          <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" aria-hidden /> Filters
          </span>
          <div className="space-y-1">
            <label htmlFor="f-risk" className="text-xs text-muted-foreground">Risk level</label>
            <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as typeof riskFilter)}>
              <SelectTrigger id="f-risk" className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="f-status" className="text-xs text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger id="f-status" className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="f-area" className="text-xs text-muted-foreground">Location</label>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger id="f-area" className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {AREAS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Incident list */}
      <section className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Prioritised incidents</h2>
          <DemoBadge />
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No incidents match" body="Try widening the filters, or check back when new reports arrive." />
        ) : (
          <ul className="space-y-3">
            {filtered.map((i) => {
              const st = statusOf(i);
              return (
                <li key={i.id} className="rounded-xl border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{i.areaName} — {i.title}</p>
                      <p className="text-xs text-muted-foreground">{i.time} · {i.sourceLabel}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <RiskBadge level={i.level} />
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", responseStatusStyles[st])}>
                        {RESPONSE_STATUS_LABEL[st]}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{i.detail}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Suggested action:</span> {i.action}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2" aria-label={`Update status for ${i.areaName}`}>
                    {(["new", "in-progress", "resolved"] as ResponseStatus[]).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={st === s ? "default" : "outline"}
                        onClick={() => updateStatus(i, s)}
                        aria-pressed={st === s}
                      >
                        {RESPONSE_STATUS_LABEL[s]}
                      </Button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Status changes are stored in this browser only. Suggested actions are fixed rules for demonstration, not official
        guidance. In an emergency, contact official services.
      </p>
    </div>
  );
}

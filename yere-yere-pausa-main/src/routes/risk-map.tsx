import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { HorizonPicker } from "@/components/app/horizon-picker";
import { RiskLeafletMap } from "@/components/app/lazy-map";
import { RiskDetails } from "@/components/app/risk-details";
import { EmptyState, PageHeader, RiskBadge, riskDot } from "@/components/app/ui-bits";
import { useAppState } from "@/lib/app-state";
import { AREAS, RISK_LABEL, riskLevel, type RiskLevel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/risk-map")({
  head: () => ({
    meta: [
      { title: "Risk Map — Yere Yere Pausa" },
      { name: "description", content: "Interactive Pune map of simulated waterlogging risk with forecast horizons and explainable factors." },
      { property: "og:title", content: "Risk Map — Yere Yere Pausa" },
      { property: "og:description", content: "Explore simulated waterlogging risk across Pune." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RiskMapPage,
});

const ALL: RiskLevel[] = ["low", "moderate", "high", "severe"];

function RiskMapPage() {
  const { horizon, areaId, setAreaId } = useAppState();
  const [levels, setLevels] = useState<RiskLevel[]>(ALL);
  const [open, setOpen] = useState(false);
  const mobile = useIsMobile();
  const visible = AREAS.filter((a) => levels.includes(riskLevel(a.scores[horizon])));

  const select = (id: string) => {
    setAreaId(id);
    setOpen(true);
  };
  const toggle = (l: RiskLevel) => setLevels((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));

  return (
    <div className="space-y-5">
      <PageHeader title="Risk Map" subtitle="Demo markers at approximate Pune locations. Tap a marker for details." actions={<HorizonPicker />} />

      <fieldset className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <legend className="sr-only">Filter risk levels</legend>
        <span className="mr-1 text-sm font-medium">Show:</span>
        {ALL.map((l) => (
          <label key={l} className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm focus-within:ring-2 focus-within:ring-ring">
            <Checkbox checked={levels.includes(l)} onCheckedChange={() => toggle(l)} />
            <span className={cn("h-2.5 w-2.5 rounded-full", riskDot(l))} aria-hidden />
            {RISK_LABEL[l]}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <RiskLeafletMap horizon={horizon} levels={levels} selectedId={open ? areaId : null} onSelect={select} heightClass="h-[60vh] min-h-[360px]" />
        <aside className="rounded-2xl border bg-card p-4 sm:p-5">
          {!mobile && open ? (
            <RiskDetails areaId={areaId} horizon={horizon} onClose={() => setOpen(false)} />
          ) : (
            <>
              <h2 className="mb-2 font-display text-lg font-semibold">Areas ({visible.length})</h2>
              {visible.length === 0 ? (
                <EmptyState icon={MapPin} title="No areas match" body="Turn on more risk levels to see areas." />
              ) : (
                <ul className="divide-y">
                  {visible.map((a) => (
                    <li key={a.id}>
                      <button onClick={() => select(a.id)} className="flex w-full items-center justify-between gap-2 rounded-md py-3 text-left hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="min-w-0 truncate font-medium">{a.name}</span>
                        <RiskBadge level={riskLevel(a.scores[horizon])} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </aside>
      </div>

      {mobile && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetTitle className="sr-only">Area details</SheetTitle>
            <RiskDetails areaId={areaId} horizon={horizon} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

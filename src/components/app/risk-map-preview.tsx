import { cn } from "@/lib/utils";
import { AREAS, riskLevel, type Horizon } from "@/lib/mock-data";
import { riskDot } from "./ui-bits";

/** Schematic (not geographic) preview of simulated area risk. */
export function RiskMapPreview({ horizon }: { horizon: Horizon }) {
  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border bg-secondary"
      role="img"
      aria-label="Schematic map of simulated waterlogging risk across Pune areas"
    >
      <svg className="absolute inset-0 h-full w-full text-border" viewBox="0 0 100 62.5" preserveAspectRatio="none" aria-hidden>
        <defs>
          <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M6 0H0V6" fill="none" stroke="currentColor" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect width="100" height="62.5" fill="url(#grid)" />
        <path d="M0 22 C20 18, 35 30, 50 26 S80 14, 100 20" fill="none" className="stroke-rain" strokeOpacity="0.55" strokeWidth="1.6" />
        <path d="M10 62 L40 30 L60 10" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M0 40 L100 38" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path d="M50 62 L48 0" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>
      <span className="absolute left-3 top-[30%] text-[10px] font-medium text-rain">Mula–Mutha river</span>
      {AREAS.map((a) => {
        const lvl = riskLevel(a.scores[horizon]);
        const size = 10 + a.scores[horizon] / 4;
        return (
          <div key={a.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${a.x}%`, top: `${a.y}%` }}>
            <span
              className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 transition-all duration-500", riskDot(lvl))}
              style={{ width: size * 2.4, height: size * 2.4 }}
            />
            <span className={cn("relative block h-3 w-3 rounded-full ring-2 ring-card", riskDot(lvl))} />
            <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded bg-card/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm">
              {a.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

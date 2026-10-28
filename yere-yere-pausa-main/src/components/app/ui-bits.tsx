import { FlaskConical, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RISK_LABEL, type RiskLevel } from "@/lib/mock-data";

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground",
        className,
      )}
      title="Simulated information for demonstration only"
    >
      <FlaskConical className="h-3 w-3" aria-hidden /> Demo data
    </span>
  );
}

const riskStyles: Record<RiskLevel, string> = {
  low: "bg-safe/15 text-foreground border-safe/40",
  moderate: "bg-rain/15 text-foreground border-rain/40",
  high: "bg-warning/20 text-foreground border-warning/50",
  severe: "bg-danger/15 text-danger border-danger/40",
};
const dotStyles: Record<RiskLevel, string> = {
  low: "bg-safe",
  moderate: "bg-rain",
  high: "bg-warning",
  severe: "bg-danger",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", riskStyles[level])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[level])} aria-hidden />
      {RISK_LABEL[level]}
    </span>
  );
}

export function riskDot(level: RiskLevel) {
  return dotStyles[level];
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <span className="mb-2 block h-px w-10 bg-primary" aria-hidden />
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "primary" | "rain" | "warning" | "danger";
}) {
  const toneCls = {
    primary: "bg-primary/12 text-primary",
    rain: "bg-rain/15 text-rain",
    warning: "bg-warning/20 text-warning-foreground dark:text-warning",
    danger: "bg-danger/15 text-danger",
  }[tone];
  return (
    <div className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", toneCls)}>
          <Icon className="h-4.5 w-4.5" aria-hidden />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

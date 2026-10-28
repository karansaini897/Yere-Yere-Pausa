import { createFileRoute } from "@tanstack/react-router";
import { Camera, CheckCircle2, Copy, Lightbulb, MessagesSquare, Send, TriangleAlert, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DemoBadge, EmptyState, PageHeader, RiskBadge } from "@/components/app/ui-bits";
import { useAppState } from "@/lib/app-state";
import { AREAS, riskLevel } from "@/lib/mock-data";
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  findDuplicates,
  formatReportTime,
  reportAreaName,
  useCitizenReports,
  useSuggestions,
  type CitizenReport,
  type ReportCategory,
  type ReportStatus,
} from "@/lib/community-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Board — Yere Yere Pausa" },
      { name: "description", content: "See and share on-ground waterlogging reports, and suggest features." },
      { property: "og:title", content: "Community Board — Yere Yere Pausa" },
      { property: "og:description", content: "See and share on-ground waterlogging reports, and suggest features." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunityPage,
});

const statusStyles: Record<ReportStatus, string> = {
  "citizen-reported": "bg-rain/15 text-foreground border-rain/40",
  "under-review": "bg-warning/20 text-foreground border-warning/50",
  confirmed: "bg-danger/15 text-danger border-danger/40",
  resolved: "bg-safe/15 text-foreground border-safe/40",
};

function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", statusStyles[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function CommunityPage() {
  const { horizon } = useAppState();
  const { reports, addReport } = useCitizenReports();

  // Form state
  const [areaId, setAreaId] = useState("");
  const [category, setCategory] = useState<ReportCategory | "">("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicates, setDuplicates] = useState<CitizenReport[] | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  useEffect(() => {
    if (!photo) {
      setPhotoUrl(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const predicted = useMemo(
    () => [...AREAS].sort((a, b) => b.scores[horizon] - a.scores[horizon]).filter((a) => a.scores[horizon] >= 40),
    [horizon],
  );

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!areaId) e['area'] = "Choose a neighbourhood.";
    if (!category) e['category'] = "Choose a category.";
    if (description.trim().length < 10) e['description'] = "Describe what you see in at least 10 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function resetForm() {
    setAreaId("");
    setCategory("");
    setDescription("");
    setPhoto(null);
    setErrors({});
  }

  function doSubmit() {
    const report = addReport({
      areaId,
      category: category as ReportCategory,
      description: description.trim(),
      hasPhoto: !!photo,
    });
    setDuplicates(null);
    setConfirmedId(report.id);
    resetForm();
    toast.success("Report submitted", { description: "Thank you — your report is now listed as “Citizen reported”." });
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setConfirmedId(null);
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const dupes = findDuplicates({ areaId, category: category as ReportCategory, createdAt: new Date().toISOString() }, reports);
    if (dupes.length > 0) {
      setDuplicates(dupes);
      return;
    }
    doSubmit();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community Board"
        subtitle={
          <>
            On-ground reports from residents, kept separate from simulated risk predictions. <DemoBadge className="ml-1" />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Submit form */}
        <section className="rounded-2xl border bg-card p-4 sm:p-5 lg:col-span-2" aria-labelledby="report-form-heading">
          <h2 id="report-form-heading" className="font-display text-lg font-semibold">Report waterlogging</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Demo only — reports are stored in this browser, not sent anywhere. Photos are previewed but never saved.
          </p>

          {confirmedId && (
            <div role="status" className="mt-4 flex items-start gap-2 rounded-xl border border-safe/40 bg-safe/15 p-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe" aria-hidden />
              <p>Report received. It appears in the list on the right with the status “Citizen reported”.</p>
            </div>
          )}

          <form className="mt-4 space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="report-area">Neighbourhood</Label>
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger id="report-area" aria-invalid={!!errors['area']}>
                  <SelectValue placeholder="Choose a neighbourhood" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.ward})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors['area'] && <p className="text-xs text-danger">{errors['area']}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="report-category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ReportCategory)}>
                <SelectTrigger id="report-category" aria-invalid={!!errors['category']}>
                  <SelectValue placeholder="What kind of problem?" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABEL) as ReportCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors['category'] && <p className="text-xs text-danger">{errors['category']}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="report-desc">Description</Label>
              <Textarea
                id="report-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Water up to the ankle near the bus stop, vehicles slowing down."
                rows={3}
                aria-invalid={!!errors['description']}
              />
              {errors['description'] && <p className="text-xs text-danger">{errors['description']}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="report-photo">Photo (optional, preview only)</Label>
              <Input
                id="report-photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
              {photoUrl && (
                <div className="relative mt-2 inline-block">
                  <img src={photoUrl} alt="Preview of attached photo" className="h-28 w-auto rounded-lg border object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border bg-card text-muted-foreground shadow-sm"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">The photo is shown here for checking and is not stored or uploaded.</p>
            </div>

            <Button type="submit" className="w-full">
              <Send className="h-4 w-4" /> Submit report
            </Button>
          </form>

          {/* Duplicate warning */}
          {duplicates && (
            <div role="alert" className="mt-4 rounded-xl border border-warning/50 bg-warning/15 p-4">
              <p className="flex items-center gap-2 font-semibold">
                <Copy className="h-4 w-4" aria-hidden /> Possible duplicate
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                A similar report (same neighbourhood and category, within the last hour) already exists. This check uses simple
                matching only — please review before submitting again.
              </p>
              <ul className="mt-3 space-y-2">
                {duplicates.map((d) => (
                  <li key={d.id} className="rounded-lg border bg-card p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{reportAreaName(d)}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="mt-1 text-muted-foreground">{d.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatReportTime(d.createdAt)} IST</p>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={doSubmit}>Submit anyway</Button>
                <Button size="sm" variant="outline" onClick={() => setDuplicates(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </section>

        {/* Reports list */}
        <section className="space-y-6 lg:col-span-3">
          <div className="rounded-2xl border bg-card p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">Citizen reports</h2>
              <DemoBadge />
            </div>
            {reports.length === 0 ? (
              <EmptyState icon={MessagesSquare} title="No reports yet" body="Be the first to report waterlogging in your neighbourhood." />
            ) : (
              <ul className="space-y-3">
                {reports.map((r) => (
                  <li key={r.id} className="rounded-xl border bg-background p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{reportAreaName(r)}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">{CATEGORY_LABEL[r.category]}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
                    <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatReportTime(r.createdAt)} IST</span>
                      {r.hasPhoto && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                          <Camera className="h-3 w-3" aria-hidden /> Photo attached (not stored)
                        </span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">Predicted risk areas</h2>
              <DemoBadge />
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              These come from the simulated risk model, not from citizen reports — they are shown separately on purpose.
            </p>
            {predicted.length === 0 ? (
              <EmptyState icon={TriangleAlert} title="No elevated predictions" body="No area is predicted at moderate risk or above for this horizon." />
            ) : (
              <ul className="divide-y">
                {predicted.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.note}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold">Predicted risk</span>
                      <RiskBadge level={riskLevel(a.scores[horizon])} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <SuggestionSection />
    </div>
  );
}

function SuggestionSection() {
  const { suggestions, addSuggestion } = useSuggestions();
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (title.trim().length < 4) e['title'] = "Give your idea a short title (at least 4 characters).";
    if (problem.trim().length < 10) e['problem'] = "Describe the problem it solves (at least 10 characters).";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    addSuggestion({ title: title.trim(), problem: problem.trim() });
    setTitle("");
    setProblem("");
    toast.success("Idea submitted", { description: "Thanks! Your suggestion is listed below." });
  }

  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-labelledby="suggest-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="suggest-heading" className="font-display text-lg font-semibold">Write your own idea</h2>
          <p className="text-xs text-muted-foreground">Suggest a feature for Yere Yere Pausa. Saved in this browser only (demo).</p>
        </div>
        <DemoBadge />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="idea-title">Idea title</Label>
            <Input id="idea-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SMS alerts for my ward" aria-invalid={!!errors['title']} />
            {errors['title'] && <p className="text-xs text-danger">{errors['title']}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="idea-problem">What problem does it solve?</Label>
            <Textarea id="idea-problem" value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} placeholder="e.g. My parents don't use apps, but they need to know when their street floods." aria-invalid={!!errors['problem']} />
            {errors['problem'] && <p className="text-xs text-danger">{errors['problem']}</p>}
          </div>
          <Button type="submit">
            <Lightbulb className="h-4 w-4" /> Submit idea
          </Button>
        </form>
        <div>
          {suggestions.length === 0 ? (
            <EmptyState icon={Lightbulb} title="No ideas yet" body="Submitted feature ideas will appear here." />
          ) : (
            <ul className="space-y-3">
              {suggestions.map((s) => (
                <li key={s.id} className="rounded-xl border bg-background p-4">
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.problem}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatReportTime(s.createdAt)} IST</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Map, MessagesSquare, Route as RouteIcon } from "lucide-react";
import { MonsoonCanvas } from "@/components/landing/monsoon-canvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yere Yere Pausa — Know the risk before the rain" },
      { name: "description", content: "Waterlogging risk mapping, safer routes and community reports for Pune's monsoon. Demo scenario with simulated data." },
      { property: "og:title", content: "Yere Yere Pausa — Know the risk before the rain" },
      { property: "og:description", content: "Know the risk. Plan ahead. Stay safe. A monsoon waterlogging early-warning prototype for Pune." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const CTAS = [
  { to: "/risk-map", label: "Explore Risk Map", icon: Map, primary: true },
  { to: "/trip-planner", label: "Plan a Safer Route", icon: RouteIcon },
  { to: "/community", label: "Community Reports", icon: MessagesSquare },
] as const;

const PILLARS = [
  { n: "01", t: "Map", d: "Road-level waterlogging risk across Pune at four horizons — now to six hours ahead." },
  { n: "02", t: "Plan", d: "Compare routes by exposure, not just distance, before you leave home." },
  { n: "03", t: "Report", d: "Neighbours flag flooded lanes; corroborated reports sharpen the picture." },
];

function Landing() {
  return (
    <div className="landing min-h-screen font-sans">
      <section className="relative isolate flex min-h-screen flex-col overflow-hidden">
        <MonsoonCanvas />

        <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
          <span className="font-serif text-xl tracking-wide">Yere Yere Pausa</span>
          <nav className="flex items-center gap-6 text-sm text-landing-mute">
            <Link to="/dashboard" className="transition-colors hover:text-landing-paper">Dashboard</Link>
            <Link to="/rain-timeline" className="hidden transition-colors hover:text-landing-paper sm:inline">Rain timeline</Link>
            <Link to="/alerts" className="hidden transition-colors hover:text-landing-paper sm:inline">Alerts</Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-20 sm:px-10">
          <p className="landing-rise flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-landing-mute">
            <span className="h-px w-10 bg-landing-vermilion" /> Pune · Monsoon early warning
          </p>
          <h1 className="landing-rise mt-6 max-w-4xl font-serif text-5xl leading-[1.02] font-medium sm:text-7xl lg:text-8xl" style={{ animationDelay: "120ms" }}>
            Know the risk.<br />
            Plan ahead.<br />
            <em className="text-landing-vermilion">Stay safe.</em>
          </h1>
          <p lang="mr" className="landing-rise mt-6 font-marathi text-lg text-landing-mute sm:text-xl" style={{ animationDelay: "240ms" }}>
            पाऊस येण्याआधी, तयारी आपल्या हाती.
          </p>

          <div className="landing-rise mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ animationDelay: "360ms" }}>
            {CTAS.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className={
                  "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-vermilion " +
                  ("primary" in c
                    ? "bg-landing-vermilion text-landing-ink hover:bg-landing-paper"
                    : "border border-landing-line text-landing-paper hover:border-landing-paper")
                }
              >
                <c.icon className="h-4 w-4" aria-hidden /> {c.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            ))}
          </div>

          <p className="landing-rise mt-8 max-w-md text-xs text-landing-mute" style={{ animationDelay: "480ms" }}>
            Prototype · all risk scores, rainfall and reports shown in this app are a <strong className="text-landing-paper">simulated demo scenario</strong>, not a live forecast.
          </p>
        </div>
      </section>

      <section className="border-t border-landing-line">
        <div className="mx-auto grid max-w-6xl gap-px bg-landing-line sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.n} className="bg-landing-ink px-6 py-10 sm:px-10">
              <span className="text-xs tracking-[0.3em] text-landing-vermilion">{p.n}</span>
              <h2 className="mt-3 font-serif text-3xl">{p.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-landing-mute">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="flex flex-col items-center justify-between gap-2 px-6 py-8 text-xs text-landing-mute sm:flex-row sm:px-10">
        <span>Yere Yere Pausa · येरे येरे पावसा</span>
        <Link to="/dashboard" className="hover:text-landing-paper">Open the operational dashboard →</Link>
      </footer>
    </div>
  );
}

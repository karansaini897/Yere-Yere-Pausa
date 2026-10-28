import { useEffect, useRef, useState } from "react";

/**
 * Lightweight procedural rain + mist background. Runs only after hydration
 * (inside useEffect). The static gradient behind it is the fallback for SSR,
 * reduced-motion users, and devices without 2D canvas support.
 */
export function MonsoonCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0, last = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    type Drop = { x: number; y: number; len: number; v: number; a: number };
    type Mist = { x: number; y: number; r: number; v: number; a: number };
    let drops: Drop[] = [];
    let mist: Mist[] = [];

    const seed = () => {
      const count = Math.round(Math.min(220, (w * h) / 9000));
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        len: 8 + Math.random() * 22, v: 500 + Math.random() * 600, a: 0.08 + Math.random() * 0.22,
      }));
      mist = Array.from({ length: 6 }, (_, i) => ({
        x: Math.random() * w, y: h * (0.45 + (i / 6) * 0.5),
        r: Math.max(w, h) * (0.25 + Math.random() * 0.2), v: 6 + Math.random() * 10, a: 0.04 + Math.random() * 0.05,
      }));
    };
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (const m of mist) {
        m.x += m.v * dt;
        if (m.x - m.r > w) m.x = -m.r;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        g.addColorStop(0, `rgba(170,190,215,${m.a})`);
        g.addColorStop(1, "rgba(170,190,215,0)");
        ctx.fillStyle = g;
        ctx.fillRect(m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
      }
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      for (const d of drops) {
        d.y += d.v * dt; d.x -= d.v * dt * 0.12;
        if (d.y > h) { d.y = -d.len; d.x = Math.random() * (w + 80); }
        ctx.strokeStyle = `rgba(200,215,235,${d.a})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.len * 0.12, d.y - d.len);
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    const onMotion = () => { if (reduce.matches) { cancelAnimationFrame(raf); setActive(false); } };

    resize();
    setActive(true);
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    reduce.addEventListener("change", onMotion);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      reduce.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <div className="landing-static-bg pointer-events-none absolute inset-0" aria-hidden>
      <canvas ref={ref} className="h-full w-full transition-opacity duration-1000" style={{ opacity: active ? 1 : 0 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-landing-ink" />
    </div>
  );
}

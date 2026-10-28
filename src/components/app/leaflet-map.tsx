// Browser-only: imports Leaflet. Load via React.lazy behind <ClientOnly> (see lazy-map.tsx).
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import { AREAS, AREA_COORDS, PUNE_CENTER, RISK_LABEL, riskLevel, type DemoRoute, type Horizon, type RiskLevel } from "@/lib/mock-data";

const COLOR_VAR: Record<RiskLevel, string> = { low: "--safe", moderate: "--rain", high: "--warning", severe: "--danger" };

function cssColor(v: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "#888";
}

function FitTo({ points }: { points?: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 1) map.fitBounds(points, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

export interface LeafletMapProps {
  horizon: Horizon;
  levels?: RiskLevel[];
  selectedId?: string | null | undefined;
  onSelect?: (id: string) => void;
  routes?: DemoRoute[];
  activeRouteId?: string | undefined;
  className?: string;
}

export default function LeafletMap({ horizon, levels, selectedId, onSelect, routes, activeRouteId, className }: LeafletMapProps) {
  const active = routes?.find((r) => r.id === activeRouteId);
  const primary = cssColor("--primary");
  const muted = cssColor("--muted-foreground");
  return (
    <MapContainer center={PUNE_CENTER} zoom={12} scrollWheelZoom {...(className ? { className } : {})} style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {routes?.map((r) => (
        <Polyline
          key={r.id}
          positions={r.points}
          pathOptions={{ color: r.id === activeRouteId ? primary : muted, weight: r.id === activeRouteId ? 6 : 4, opacity: r.id === activeRouteId ? 0.9 : 0.45, dashArray: "8 6" }}
        />
      ))}
      {active && <FitTo points={active.points} />}
      {AREAS.map((a) => {
        const score = a.scores[horizon];
        const lvl = riskLevel(score);
        if (levels && !levels.includes(lvl)) return null;
        const color = cssColor(COLOR_VAR[lvl]);
        const sel = selectedId === a.id;
        return (
          <CircleMarker
            key={a.id}
            center={AREA_COORDS[a.id]!}
            radius={10 + score / 8}
            pathOptions={{ color: sel ? cssColor("--foreground") : color, weight: sel ? 3 : 1.5, fillColor: color, fillOpacity: 0.45 }}
            eventHandlers={{ click: () => onSelect?.(a.id) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <strong>{a.name}</strong> · {RISK_LABEL[lvl]} ({score}) · Demo
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

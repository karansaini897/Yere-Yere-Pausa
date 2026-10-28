import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, Component, type ReactNode } from "react";
import { MapPinOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoBadge } from "./ui-bits";
import type { LeafletMapProps } from "./leaflet-map";

const LeafletMap = lazy(() => import("./leaflet-map"));

class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    if (this.state.failed)
      return (
        <div className="grid h-full place-items-center p-6 text-center">
          <div>
            <MapPinOff className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 font-semibold">Map couldn't load</p>
            <p className="text-sm text-muted-foreground">Check your connection and refresh. The area list still works.</p>
          </div>
        </div>
      );
    return this.props.children;
  }
}

export function RiskLeafletMap(props: LeafletMapProps & { heightClass?: string }) {
  const { heightClass = "h-[420px]", ...rest } = props;
  const fallback = <Skeleton className="h-full w-full rounded-none" />;
  return (
    <div className={`relative isolate overflow-hidden rounded-xl border ${heightClass}`}>
      <MapBoundary>
        <ClientOnly fallback={fallback}>
          <Suspense fallback={fallback}>
            <LeafletMap {...rest} />
          </Suspense>
        </ClientOnly>
      </MapBoundary>
      <DemoBadge className="pointer-events-none absolute right-2 top-2 z-[500] bg-card" />
    </div>
  );
}

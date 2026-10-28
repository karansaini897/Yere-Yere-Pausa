import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { HORIZONS, type Horizon } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-state";

/** Shared forecast horizon control — reads/writes app-wide state. */
export function HorizonPicker({ variant = "default", className }: { variant?: "default" | "onDark"; className?: string }) {
  const { horizon, setHorizon } = useAppState();
  const dark = variant === "onDark";
  return (
    <div role="group" aria-label="Forecast horizon" className={className}>
      <ToggleGroup
        type="single"
        value={horizon}
        onValueChange={(v) => v && setHorizon(v as Horizon)}
        className={cn("rounded-xl p-1", dark ? "bg-background/15" : "border bg-muted")}
      >
        {HORIZONS.map((h) => (
          <ToggleGroupItem
            key={h.id}
            value={h.id}
            className={cn(
              "rounded-lg px-3 data-[state=on]:bg-card data-[state=on]:text-card-foreground data-[state=on]:shadow-sm",
              dark && "text-inherit hover:bg-background/20 hover:text-inherit",
            )}
          >
            {h.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

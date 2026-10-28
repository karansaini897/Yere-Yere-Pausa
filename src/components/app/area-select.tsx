import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/lib/app-state";
import { AREAS } from "@/lib/mock-data";

/** Shared sample-area selector bound to app-wide selected location. */
export function AreaSelect({ label = "Sample area" }: { label?: string }) {
  const { areaId, setAreaId } = useAppState();
  return (
    <div className="min-w-[200px]">
      <Label htmlFor="area-select" className="mb-1.5 block">{label}</Label>
      <Select value={areaId} onValueChange={setAreaId}>
        <SelectTrigger id="area-select" className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {AREAS.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

import { describe, expect, it } from "vitest";
import { findDuplicates, suggestedAction, type CitizenReport } from "./community-store";

const base: CitizenReport = {
  id: "r1",
  areaId: "sinhagad",
  category: "waterlogged-road",
  description: "Water near the signal",
  createdAt: "2026-10-18T12:00:00.000Z",
  hasPhoto: false,
  status: "citizen-reported",
};

describe("findDuplicates", () => {
  const candidate = { areaId: "sinhagad", category: "waterlogged-road" as const, createdAt: "2026-10-18T12:30:00.000Z" };

  it("flags same area, same category, within 60 minutes", () => {
    expect(findDuplicates(candidate, [base])).toHaveLength(1);
  });

  it("ignores a different category", () => {
    expect(findDuplicates(candidate, [{ ...base, category: "blocked-drain" }])).toHaveLength(0);
  });

  it("ignores a different area", () => {
    expect(findDuplicates(candidate, [{ ...base, areaId: "kothrud" }])).toHaveLength(0);
  });

  it("ignores reports older than 60 minutes", () => {
    expect(findDuplicates(candidate, [{ ...base, createdAt: "2026-10-18T11:00:00.000Z" }])).toHaveLength(0);
  });
});

describe("suggestedAction", () => {
  it("maps report categories to fixed actions", () => {
    expect(suggestedAction({ kind: "report", category: "flooded-underpass" })).toBe("Review road closure requirements");
    expect(suggestedAction({ kind: "report", category: "blocked-drain" })).toBe("Inspect drainage");
  });

  it("escalates severe predicted risk to signage", () => {
    expect(suggestedAction({ kind: "predicted", score: 85 })).toBe("Place warning signage");
    expect(suggestedAction({ kind: "predicted", score: 65 })).toBe("Inspect drainage");
  });
});

import { describe, expect, it } from "vitest";
import { riskLevel } from "./mock-data";

describe("riskLevel", () => {
  it("maps score bands", () => {
    expect(riskLevel(39)).toBe("low");
    expect(riskLevel(40)).toBe("moderate");
    expect(riskLevel(60)).toBe("high");
    expect(riskLevel(80)).toBe("severe");
  });
});

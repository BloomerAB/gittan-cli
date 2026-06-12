import { describe, expect, it } from "vitest"

import { output } from "../src/output.js"

describe("output", () => {
  describe("json format", () => {
    it("outputs formatted JSON", () => {
      const result = output({ name: "platform", id: "t1" }, "json")
      expect(JSON.parse(result)).toEqual({ name: "platform", id: "t1" })
    })

    it("handles arrays", () => {
      const result = output([{ name: "a" }, { name: "b" }], "json")
      const parsed = JSON.parse(result)
      expect(parsed).toHaveLength(2)
    })
  })

  describe("pretty format", () => {
    it("formats object with aligned keys", () => {
      const result = output({ name: "platform", displayName: "Platform Team" }, "pretty")
      expect(result).toContain("name")
      expect(result).toContain("platform")
      expect(result).toContain("displayName")
      expect(result).toContain("Platform Team")
    })

    it("joins arrays with commas", () => {
      const result = output({ tags: ["production", "critical"] }, "pretty")
      expect(result).toContain("production, critical")
    })

    it("skips null/undefined values", () => {
      const result = output({ name: "test", empty: null, missing: undefined }, "pretty")
      expect(result).not.toContain("empty")
      expect(result).not.toContain("missing")
    })
  })

  describe("table format", () => {
    it("formats array as table", () => {
      const data = [
        { name: "api", status: "green", team: "platform" },
        { name: "web", status: "red", team: "frontend" },
      ]
      const result = output(data, "table")

      expect(result).toContain("NAME")
      expect(result).toContain("STATUS")
      expect(result).toContain("TEAM")
      expect(result).toContain("api")
      expect(result).toContain("green")
      expect(result).toContain("platform")
      expect(result).toContain("─")
    })

    it("returns empty for empty array", () => {
      expect(output([], "table")).toBe("")
    })
  })
})

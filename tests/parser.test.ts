import { describe, expect, it } from "vitest"

import { parse } from "../src/parser.js"

describe("parse", () => {
  it("parses bare command", () => {
    const result = parse(["teams", "list"])
    expect(result.command).toEqual(["teams", "list"])
    expect(result.flags).toEqual({})
  })

  it("parses flags with values", () => {
    const result = parse(["repos", "list", "--team", "platform", "--org", "bloomer"])
    expect(result.command).toEqual(["repos", "list"])
    expect(result.flags).toEqual({ team: "platform", org: "bloomer" })
  })

  it("parses flags with equals syntax", () => {
    const result = parse(["teams", "--format=table", "--org=bloomer"])
    expect(result.command).toEqual(["teams"])
    expect(result.flags).toEqual({ format: "table", org: "bloomer" })
  })

  it("parses boolean flags", () => {
    const result = parse(["status", "--verbose", "--json"])
    expect(result.command).toEqual(["status"])
    expect(result.flags.verbose).toBe(true)
    expect(result.flags.json).toBe(true)
  })

  it("handles empty argv", () => {
    const result = parse([])
    expect(result.command).toEqual([])
    expect(result.flags).toEqual({})
  })

  it("handles mixed commands and flags", () => {
    const result = parse(["repos", "create", "api-service", "--team", "t1", "--description", "Main API"])
    expect(result.command).toEqual(["repos", "create", "api-service"])
    expect(result.flags).toEqual({ team: "t1", description: "Main API" })
  })
})

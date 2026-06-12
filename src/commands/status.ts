import type { TApiClient } from "../api/client.js"
import { output, type TOutputFormat } from "../output.js"

export const statusCommand = async (
  client: TApiClient,
  _args: ReadonlyArray<string>,
  flags: Record<string, string | boolean>,
): Promise<string> => {
  const format = (flags.format as TOutputFormat) ?? "pretty"

  const health = await client.health()

  if (format === "json") {
    return output(health, "json")
  }

  const deps = health.dependencies as Array<{ name: string; healthy: boolean }>
  const lines = [
    `Gittan API: ${health.status === "healthy" ? "✓ healthy" : "✗ degraded"}`,
    "",
    ...deps.map((d) => `  ${d.healthy ? "●" : "✗"} ${d.name}`),
  ]

  return lines.join("\n")
}

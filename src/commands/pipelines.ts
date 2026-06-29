import type { TApiClient } from "../api/client.js"
import { output, type TOutputFormat } from "../output.js"

export const pipelinesCommand = async (
  client: TApiClient,
  args: ReadonlyArray<string>,
  flags: Record<string, string | boolean>,
): Promise<string> => {
  const format = (flags.format as TOutputFormat) ?? "json"

  const subcommand = args[0]

  switch (subcommand) {
    case "list": {
      const teamId = flags.team as string
      if (!teamId) return "Error: --team required"
      return output(await client.pipelines.listByTeam(teamId), format)
    }

    default:
      return [
        "Usage: gittan pipelines <command>",
        "",
        "Commands:",
        "  list --team <team-id>    List all pipelines for a team",
        "",
        "Flags:",
        "  --team <team-id>         Team ID (required)",
        "  --format <json|pretty|table>  Output format (default: json)",
      ].join("\n")
  }
}

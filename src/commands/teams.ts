import type { TApiClient } from "../api/client.js"
import { output, type TOutputFormat } from "../output.js"

export const teamsCommand = async (
  client: TApiClient,
  args: ReadonlyArray<string>,
  flags: Record<string, string | boolean>,
): Promise<string> => {
  const format = (flags.format as TOutputFormat) ?? "json"
  const orgId = (flags.org as string) ?? "default"

  const subcommand = args[0]

  switch (subcommand) {
    case "list":
      return output(await client.teams.list(orgId), format)

    case "get": {
      const teamId = args[1]
      if (!teamId) return "Error: team ID or name required"

      const team = teamId.match(/^[a-z0-9-]+$/) && !teamId.includes("-")
        ? await client.teams.getByName(orgId, teamId)
        : await client.teams.get(orgId, teamId)

      return output(team, format)
    }

    case "create": {
      const name = args[1]
      const displayName = (flags["display-name"] as string) ?? name
      if (!name) return "Error: team name required"

      const team = await client.teams.create(orgId, {
        name,
        displayName,
        slackChannel: flags["slack-channel"] as string | undefined,
      })
      return output(team, format)
    }

    case "members": {
      const teamId = args[1]
      if (!teamId) return "Error: team ID required"
      return output(await client.teams.members(teamId), format)
    }

    default:
      return [
        "Usage: gittan teams <command>",
        "",
        "Commands:",
        "  list                     List teams in org",
        "  get <id|name>            Get team details",
        "  create <name>            Create a new team",
        "  members <team-id>        List team members",
        "",
        "Flags:",
        "  --org <org-id>           Organization (default: default)",
        "  --format <json|pretty|table>  Output format (default: json)",
      ].join("\n")
  }
}

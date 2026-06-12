import type { TApiClient } from "../api/client.js"
import { output, type TOutputFormat } from "../output.js"

export const reposCommand = async (
  client: TApiClient,
  args: ReadonlyArray<string>,
  flags: Record<string, string | boolean>,
): Promise<string> => {
  const format = (flags.format as TOutputFormat) ?? "json"
  const orgId = (flags.org as string) ?? "default"

  const subcommand = args[0]

  switch (subcommand) {
    case "list": {
      const teamId = flags.team as string
      if (!teamId) return "Error: --team required"
      return output(await client.repos.listByTeam(teamId), format)
    }

    case "get": {
      const repoId = args[1]
      if (!repoId) return "Error: repo ID required"
      return output(await client.repos.get(orgId, repoId), format)
    }

    case "create": {
      const name = args[1]
      const teamId = flags.team as string
      if (!name) return "Error: repo name required"
      if (!teamId) return "Error: --team required"

      const repo = await client.repos.create(orgId, {
        name,
        teamId,
        description: flags.description as string | undefined,
        tags: flags.tags ? (flags.tags as string).split(",") : undefined,
      })
      return output(repo, format)
    }

    default:
      return [
        "Usage: gittan repos <command>",
        "",
        "Commands:",
        "  list --team <team-id>    List repos for a team",
        "  get <repo-id>            Get repo details",
        "  create <name> --team <id>  Create a new repo",
        "",
        "Flags:",
        "  --org <org-id>           Organization (default: default)",
        "  --team <team-id>         Team filter/owner",
        "  --format <json|pretty|table>  Output format (default: json)",
      ].join("\n")
  }
}

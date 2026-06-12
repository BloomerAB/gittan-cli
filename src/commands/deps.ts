import type { TApiClient } from "../api/client.js"
import { output, type TOutputFormat } from "../output.js"

export const depsCommand = async (
  _client: TApiClient,
  args: ReadonlyArray<string>,
  flags: Record<string, string | boolean>,
): Promise<string> => {
  const format = (flags.format as TOutputFormat) ?? "json"
  const subcommand = args[0]

  switch (subcommand) {
    case "graph": {
      const repoId = args[1]
      if (!repoId) return "Error: repo ID required"
      return output({ todo: `dependency graph for ${repoId}` }, format)
    }

    case "detect": {
      const repoName = args[1]
      if (!repoName) return "Error: repo name required"
      return output({ todo: `detect dependencies for ${repoName}` }, format)
    }

    default:
      return [
        "Usage: gittan deps <command>",
        "",
        "Commands:",
        "  graph <repo-id>          Show dependency graph",
        "  detect <repo-name>       Detect dependencies from manifests",
        "",
        "Flags:",
        "  --format <json|pretty>   Output format (default: json)",
      ].join("\n")
  }
}

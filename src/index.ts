#!/usr/bin/env node

import { createApiClient } from "./api/client.js"
import { depsCommand } from "./commands/deps.js"
import { devCommand } from "./commands/dev.js"
import { pipelinesCommand } from "./commands/pipelines.js"
import { reposCommand } from "./commands/repos.js"
import { statusCommand } from "./commands/status.js"
import { teamsCommand } from "./commands/teams.js"
import { parse } from "./parser.js"

const main = async (): Promise<void> => {
  const { command, flags } = parse(process.argv.slice(2))

  const baseUrl =
    (flags.api as string) ??
    process.env.GITTAN_API_URL ??
    "http://localhost:4000"

  const token =
    (flags.token as string) ?? process.env.GITTAN_TOKEN

  const client = createApiClient({ baseUrl, token })

  const cmd = command[0]
  const args = command.slice(1)

  try {
    let result: string

    switch (cmd) {
      case "status":
        result = await statusCommand(client, args, flags)
        break
      case "teams":
        result = await teamsCommand(client, args, flags)
        break
      case "repos":
        result = await reposCommand(client, args, flags)
        break
      case "pipelines":
        result = await pipelinesCommand(client, args, flags)
        break
      case "deps":
        result = await depsCommand(client, args, flags)
        break
      case "dev":
        result = await devCommand(args, flags)
        break
      case "version":
        result = "@gittan/cli 0.1.0"
        break
      case "help":
      case undefined:
        result = help()
        break
      default:
        result = `Unknown command: ${cmd}\n\n${help()}`
        process.exitCode = 1
    }

    console.log(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`Error: ${message}`)
    process.exitCode = 1
  }
}

const help = (): string =>
  [
    "gittan — CLI for gittan.eu",
    "",
    "Usage: gittan <command> [options]",
    "",
    "Commands:",
    "  status              API health and connectivity",
    "  teams               Manage teams",
    "  repos               Manage repositories",
    "  pipelines           View team pipelines",
    "  deps                Dependency graph and detection",
    "  dev                 Local multi-repo development",
    "  version             Show CLI version",
    "",
    "Global flags:",
    "  --api <url>         API base URL (default: $GITTAN_API_URL or localhost:4000)",
    "  --token <token>     Auth token (default: $GITTAN_TOKEN)",
    "  --format <format>   Output: json (default), pretty, table",
    "  --org <org-id>      Organization context",
    "",
    "JSON output by default. Machines and humans use the same API.",
  ].join("\n")

main()

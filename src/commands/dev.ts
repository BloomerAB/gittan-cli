import { execSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"

export const devCommand = async (
  args: ReadonlyArray<string>,
  flags: Record<string, string | boolean>,
): Promise<string> => {
  const subcommand = args[0]

  switch (subcommand) {
    case "link":
      return devLink(flags)
    case "status":
      return devStatus()
    case "up":
      return devUp()
    default:
      return [
        "Usage: gittan dev <command>",
        "",
        "Commands:",
        "  link               Link local repos based on dependency graph",
        "  status             Show linked repos and their status",
        "  up                 Start docker-compose infrastructure",
        "",
        "The dev command helps with local multi-repo development.",
        "It replaces the need for a monorepo by managing links between repos.",
      ].join("\n")
  }
}

function devLink(flags: Record<string, string | boolean>): string {
  const root = (flags.root as string) ?? findGittanRoot()
  if (!root) {
    return "Error: could not find gittan repo root. Use --root <path> or run from within a gittan repo."
  }

  const repos = discoverRepos(root)
  if (repos.length === 0) {
    return `No repos found in ${root}`
  }

  const links: string[] = []

  for (const repo of repos) {
    const pkgPath = resolve(repo.path, "package.json")
    if (!existsSync(pkgPath)) continue

    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    }

    for (const [depName, depVersion] of Object.entries(deps)) {
      if (typeof depVersion !== "string") continue
      if (!depVersion.startsWith("link:")) continue

      const linkedPath = resolve(repo.path, depVersion.replace("link:", ""))
      if (existsSync(linkedPath)) {
        links.push(`  ${repo.name} → ${depName} (${depVersion})`)
      } else {
        links.push(`  ${repo.name} → ${depName} (MISSING: ${linkedPath})`)
      }
    }

    for (const [depName] of Object.entries(deps)) {
      if (typeof deps[depName] !== "string") continue
      if (deps[depName].startsWith("link:")) continue

      const matchingRepo = repos.find(
        (r) => r.name !== repo.name && (
          depName === `@gittan/${r.name}` ||
          depName.endsWith(`/${r.name}`)
        ),
      )

      if (matchingRepo) {
        const relativePath = `link:../${matchingRepo.name}`
        links.push(`  ${repo.name} → ${depName} (could link: ${relativePath})`)
      }
    }
  }

  const output = [
    `Found ${repos.length} repos in ${root}:`,
    ...repos.map((r) => `  ${r.name} (${r.path})`),
    "",
    links.length > 0 ? "Links:" : "No links found.",
    ...links,
  ]

  return output.join("\n")
}

function devStatus(): string {
  const root = findGittanRoot()
  if (!root) return "Error: not in a gittan workspace."

  const repos = discoverRepos(root)
  const lines = [`Workspace: ${root}`, `Repos: ${repos.length}`, ""]

  for (const repo of repos) {
    let branch = "unknown"
    let dirty = false
    try {
      branch = execSync("git rev-parse --abbrev-ref HEAD", {
        cwd: repo.path,
        encoding: "utf-8",
      }).trim()
      const status = execSync("git status --porcelain", {
        cwd: repo.path,
        encoding: "utf-8",
      }).trim()
      dirty = status.length > 0
    } catch {
      // not a git repo
    }

    lines.push(
      `  ${repo.name.padEnd(20)} ${branch.padEnd(15)} ${dirty ? "dirty" : "clean"}`,
    )
  }

  return lines.join("\n")
}

function devUp(): string {
  const root = findGittanRoot()
  if (!root) return "Error: not in a gittan workspace."

  const composePath = resolve(root, "docker-compose.yaml")
  if (!existsSync(composePath)) {
    return `Error: no docker-compose.yaml found in ${root}`
  }

  try {
    execSync("docker compose up -d", { cwd: root, stdio: "inherit" })
    return "Infrastructure started."
  } catch {
    return "Error: failed to start docker-compose."
  }
}

function findGittanRoot(): string | null {
  let dir = process.cwd()
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, "docker-compose.yaml"))) {
      const repos = discoverRepos(dir)
      if (repos.length > 0) return dir
    }
    if (dir.includes("repo-gittan")) {
      const parts = dir.split("repo-gittan")
      return parts[0] + "repo-gittan"
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

type TRepo = { name: string; path: string }

function discoverRepos(root: string): TRepo[] {
  const repos: TRepo[] = []
  const candidates = ["types", "api", "runner", "cli", "web", "chart"]

  for (const name of candidates) {
    const repoPath = resolve(root, name)
    if (existsSync(resolve(repoPath, "package.json")) || existsSync(resolve(repoPath, "go.mod"))) {
      repos.push({ name, path: repoPath })
    }
  }

  return repos
}

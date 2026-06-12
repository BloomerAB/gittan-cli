export type TParsedCommand = {
  readonly command: ReadonlyArray<string>
  readonly flags: Record<string, string | boolean>
}

export const parse = (argv: ReadonlyArray<string>): TParsedCommand => {
  const command: string[] = []
  const flags: Record<string, string | boolean> = {}

  let i = 0
  while (i < argv.length) {
    const arg = argv[i]

    if (arg.startsWith("--")) {
      const key = arg.slice(2)
      const eqIndex = key.indexOf("=")

      if (eqIndex !== -1) {
        flags[key.slice(0, eqIndex)] = key.slice(eqIndex + 1)
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        flags[key] = argv[i + 1]
        i++
      } else {
        flags[key] = true
      }
    } else {
      command.push(arg)
    }

    i++
  }

  return { command, flags }
}

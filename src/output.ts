export type TOutputFormat = "json" | "pretty" | "table"

export const output = (data: unknown, format: TOutputFormat = "json"): string => {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2)
    case "pretty":
      return formatPretty(data)
    case "table":
      return formatTable(data)
  }
}

const formatPretty = (data: unknown): string => {
  if (Array.isArray(data)) {
    return data.map((item) => formatObject(item)).join("\n\n")
  }
  return formatObject(data)
}

const formatObject = (obj: unknown): string => {
  if (typeof obj !== "object" || obj === null) return String(obj)

  const entries = Object.entries(obj as Record<string, unknown>)
  const maxKeyLen = Math.max(...entries.map(([k]) => k.length))

  return entries
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      const key = k.padEnd(maxKeyLen)
      const value = Array.isArray(v) ? v.join(", ") : String(v)
      return `  ${key}  ${value}`
    })
    .join("\n")
}

const formatTable = (data: unknown): string => {
  if (!Array.isArray(data) || data.length === 0) return ""

  const items = data as Record<string, unknown>[]
  const keys = Object.keys(items[0])

  const widths = keys.map((key) =>
    Math.max(
      key.length,
      ...items.map((item) => String(item[key] ?? "").length),
    ),
  )

  const header = keys.map((k, i) => k.toUpperCase().padEnd(widths[i])).join("  ")
  const separator = widths.map((w) => "─".repeat(w)).join("──")
  const rows = items.map((item) =>
    keys.map((k, i) => String(item[k] ?? "").padEnd(widths[i])).join("  "),
  )

  return [header, separator, ...rows].join("\n")
}

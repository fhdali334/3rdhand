// Split en.json into smaller batch files for manual translation (useful if you don't have an API key).
// It creates i18n/exports/en-batches/en-001.json, en-002.json, ...
//
// Usage:
//   npx tsx scripts/split-en-json.ts [batchSize]
// Default batchSize = 200

import fs from "node:fs"
import path from "node:path"

type Dict = Record<string, string>

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  const dictDir = path.join(process.cwd(), "i18n", "dictionaries")
  const en = JSON.parse(fs.readFileSync(path.join(dictDir, "en.json"), "utf8")) as Dict
  const sizeArg = Number(process.argv[2])
  const batchSize = Number.isFinite(sizeArg) && sizeArg > 0 ? Math.floor(sizeArg) : 200

  const entries = Object.entries(en)
  const batches = chunk(entries, batchSize)

  const outDir = path.join(process.cwd(), "i18n", "exports", "en-batches")
  fs.mkdirSync(outDir, { recursive: true })

  batches.forEach((batch, i) => {
    const obj: Dict = {}
    for (const [k, v] of batch) obj[k] = v
    const num = String(i + 1).padStart(3, "0")
    fs.writeFileSync(path.join(outDir, `en-${num}.json`), JSON.stringify(obj, null, 2), "utf8")
  })

  console.log(`✓ Wrote ${batches.length} batch files to ${outDir}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

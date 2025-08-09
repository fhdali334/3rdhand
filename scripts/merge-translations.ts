// Merge translated JSON produced outside (e.g., ChatGPT) back into fr.json or nl.json.
// The input file(s) must be JSON mapping from the English source string -> translated string.
//
// Usage:
//   npx tsx scripts/merge-translations.ts fr i18n/imports/fr-batch-1.json [fr-batch-2.json ...]
//   npx tsx scripts/merge-translations.ts nl i18n/imports/nl-batch-1.json
//
// This lets you translate without an API key: copy en.json chunks to ChatGPT with instructions,
// get JSON back, save as files, then merge.

import fs from "node:fs"
import path from "node:path"

type Dict = Record<string, string>

function loadJSON(p: string) {
  return JSON.parse(fs.readFileSync(p, "utf8"))
}

function saveJSON(p: string, obj: any) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8")
}

async function main() {
  const [locale, ...files] = process.argv.slice(2)
  if (!locale || !["fr", "nl"].includes(locale)) {
    console.error('Usage: tsx scripts/merge-translations.ts <fr|nl> file1.json [file2.json ...]')
    process.exit(1)
  }
  if (files.length === 0) {
    console.error("Provide at least one JSON file to merge.")
    process.exit(1)
  }
  const dictDir = path.join(process.cwd(), "i18n", "dictionaries")
  const en = loadJSON(path.join(dictDir, "en.json")) as Dict
  const targetPath = path.join(dictDir, `${locale}.json`)
  const current: Dict = fs.existsSync(targetPath) ? loadJSON(targetPath) : {}

  let merged = { ...current }
  let applied = 0
  for (const f of files) {
    const patch = loadJSON(path.resolve(f)) as Dict
    for (const [key, val] of Object.entries(patch)) {
      if (en[key] && typeof val === "string" && val.trim().length > 0) {
        merged[key] = val
        applied++
      }
    }
  }

  saveJSON(targetPath, merged)
  console.log(`✓ Merged ${applied} entries into ${targetPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

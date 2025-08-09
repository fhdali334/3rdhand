// Prints coverage: how many EN keys exist and how many FR/NL are translated.
//
// Usage:
//   npx tsx scripts/check-i18n-coverage.ts
//
// Output example:
//   EN: 245 keys
//   FR: 245 total | 230 translated | 15 missing
//   NL: 245 total | 180 translated | 65 missing

import fs from "node:fs"
import path from "node:path"

type Dict = Record<string, string>

function readJSON(p: string): Dict {
  return JSON.parse(fs.readFileSync(p, "utf8"))
}

function main() {
  const dictDir = path.join(process.cwd(), "i18n", "dictionaries")
  const en = readJSON(path.join(dictDir, "en.json"))
  const fr = readJSON(path.join(dictDir, "fr.json"))
  const nl = readJSON(path.join(dictDir, "nl.json"))

  const keys = Object.keys(en)
  const total = keys.length

  const frTranslated = keys.filter((k) => fr[k] && fr[k].trim().length > 0).length
  const nlTranslated = keys.filter((k) => nl[k] && nl[k].trim().length > 0).length

  console.log(`EN: ${total} keys`)
  console.log(`FR: ${total} total | ${frTranslated} translated | ${total - frTranslated} missing`)
  console.log(`NL: ${total} total | ${nlTranslated} translated | ${total - nlTranslated} missing`)

  // Show a few missing samples for convenience
  const frMissing = keys.filter((k) => !fr[k] || fr[k].trim() === "").slice(0, 10)
  const nlMissing = keys.filter((k) => !nl[k] || nl[k].trim() === "").slice(0, 10)

  if (frMissing.length) {
    console.log("\nFR missing examples:")
    frMissing.forEach((k) => console.log(`- ${k}`))
  }
  if (nlMissing.length) {
    console.log("\nNL missing examples:")
    nlMissing.forEach((k) => console.log(`- ${k}`))
  }
}

main()

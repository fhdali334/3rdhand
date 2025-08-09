/**
 * LibreTranslate-based dictionary generator (free).
 * - Reads dictionaries/en.json
 * - Translates to target locales (default: fr, nl)
 * - Writes to dictionaries/<locale>.json
 * - Skips ICU messages by default to avoid breaking them (safe), use --include-icu to attempt naive translation.
 *
 * Usage:
 *   node scripts/translate-libre.mjs            # defaults to fr nl
 *   node scripts/translate-libre.mjs fr nl      # explicit targets
 *   node scripts/translate-libre.mjs --include-icu de es
 *
 * Optional env:
 *   LIBRETRANSLATE_URL=https://libretranslate.com  # default public instance (rate-limited)
 *   LIBRETRANSLATE_DELAY_MS=300                    # delay between requests to avoid rate limits
 *
 * Notes:
 * - Public LibreTranslate instances are rate-limited; this script goes one-by-one with delay + retry.
 * - ICU-formatted strings (plural/select) are copied from English unless you pass --include-icu.
 * - Placeholders like {name} are protected so they won't be translated.
 * - Add brand terms in BRAND_TERMS to protect them from translation.
 */

import fs from "node:fs/promises"
import path from "node:path"

// Configuration
const SOURCE_LOCALE = "en"
const DEFAULT_TARGETS = ["fr", "nl"]
const BRAND_TERMS = ["3rdHand"] // Add brand/product names NOT to translate

const ROOT = process.cwd()
const DICT_DIR = path.join(ROOT, "dictionaries")
const SOURCE_FILE = path.join(DICT_DIR, `${SOURCE_LOCALE}.json`)

const BASE_URL = (process.env.LIBRETRANSLATE_URL || "https://libretranslate.com").replace(/\/$/, "")
const TRANSLATE_URL = `${BASE_URL}/translate`
const DELAY_MS = Number(process.env.LIBRETRANSLATE_DELAY_MS || 300)

// Parse args
const rawArgs = process.argv.slice(2)
const INCLUDE_ICU = rawArgs.includes("--include-icu")
const targets = rawArgs.filter((a) => !a.startsWith("--"))
const TARGETS = targets.length ? targets : DEFAULT_TARGETS

// Utils
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function isIcuMessage(text) {
  // Detect ICU plural/select patterns like: "{count, plural, one {...} other {...}}"
  return /\{[^}]*,\s*(plural|select)\s*,/i.test(text)
}

// Gather all strings with their deep paths (works with nested objects/arrays)
function collectStrings(node, currentPath = []) {
  const results = []
  if (typeof node === "string") {
    results.push({ path: currentPath, value: node })
    return results
  }
  if (Array.isArray(node)) {
    node.forEach((item, idx) => {
      results.push(...collectStrings(item, [...currentPath, idx]))
    })
    return results
  }
  if (node && typeof node === "object") {
    for (const key of Object.keys(node)) {
      results.push(...collectStrings(node[key], [...currentPath, key]))
    }
  }
  return results
}

// Set deep value by path
function setDeep(target, pathArr, value) {
  let ref = target
  for (let i = 0; i < pathArr.length; i++) {
    const key = pathArr[i]
    const isLast = i === pathArr.length - 1
    if (isLast) {
      ref[key] = value
    } else {
      const nextKey = pathArr[i + 1]
      const shouldBeArray = typeof nextKey === "number"
      if (!(key in ref) || typeof ref[key] !== "object") {
        ref[key] = shouldBeArray ? [] : {}
      }
      ref = ref[key]
    }
  }
}

// Mask placeholders (like {name}) but do NOT mask ICU blocks.
// We only mask braces that do not contain a comma (to avoid masking ICU controls).
function maskText(text) {
  let counter = 0
  const map = new Map()

  // Mask simple placeholders: {name}, {0}, {brand}, but not {count, plural, ...}
  text = text.replace(/\{[^,}]+\}/g, (match) => {
    const token = `__PH_${counter++}__`
    map.set(token, match)
    return token
  })

  // Mask brand terms (case-sensitive exact appearances)
  for (const term of BRAND_TERMS) {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
    text = text.replace(regex, () => {
      const token = `__BR_${counter++}__`
      map.set(token, term)
      return token
    })
  }

  return { masked: text, map }
}

function unmaskText(text, map) {
  let result = text
  for (const [token, original] of map.entries()) {
    result = result.split(token).join(original)
  }
  return result
}

async function translateOne(text, target, source = SOURCE_LOCALE) {
  const body = {
    q: text,
    source,
    target,
    format: "text",
  }

  // Basic retry with exponential backoff for 429/5xx
  const maxAttempts = 6
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(TRANSLATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const json = await res.json()
      const translated = json?.translatedText
      if (typeof translated !== "string") {
        throw new Error("Invalid response from LibreTranslate.")
      }
      return translated
    }

    if (res.status >= 500 || res.status === 429) {
      const wait = Math.min(15000, DELAY_MS * Math.pow(2, attempt - 1))
      console.warn(`LibreTranslate ${res.status} on attempt ${attempt}. Retrying in ${wait}ms...`)
      await sleep(wait)
      continue
    }

    const errText = await res.text()
    throw new Error(`LibreTranslate error (${res.status}): ${errText}`)
  }

  throw new Error("LibreTranslate retry limit reached.")
}

async function translateValues(values, target) {
  const out = []
  for (let i = 0; i < values.length; i++) {
    const original = values[i]

    // Handle ICU safely (copy unless --include-icu provided)
    if (isIcuMessage(original) && !INCLUDE_ICU) {
      out.push(original) // copy English to avoid breaking ICU
      continue
    }

    // Mask placeholders and brand terms
    const { masked, map } = maskText(original)
    const translatedMasked = await translateOne(masked, target)
    const translated = unmaskText(translatedMasked, map)

    out.push(translated)

    // Throttle between requests to avoid rate limits on public instance
    if (DELAY_MS > 0) await sleep(DELAY_MS)
  }
  return out
}

async function main() {
  console.log(`LibreTranslate endpoint: ${BASE_URL}`)
  console.log(`Delay between requests: ${DELAY_MS}ms`)
  console.log(`ICU handling: ${INCLUDE_ICU ? "Attempt naive translation (may break)" : "Skip (safe, copies English)"}`)
  console.log(`Reading source: ${SOURCE_FILE}`)

  const sourceRaw = await fs.readFile(SOURCE_FILE, "utf-8")
  const sourceJson = JSON.parse(sourceRaw)

  console.log(`Collecting strings from ${SOURCE_LOCALE}.json ...`)
  const entries = collectStrings(sourceJson)
  const values = entries.map((e) => e.value)

  if (values.length === 0) {
    console.log("No strings found to translate. Exiting.")
    return
  }

  for (const target of TARGETS) {
    if (target === SOURCE_LOCALE) {
      console.log(`Skipping target ${target} (same as source).`)
      continue
    }

    console.log(`Translating ${values.length} strings to "${target}"...`)
    const translatedValues = await translateValues(values, target)

    const out = Array.isArray(sourceJson) ? [] : {}
    entries.forEach((entry, idx) => {
      setDeep(out, entry.path, translatedValues[idx])
    })

    const outFile = path.join(DICT_DIR, `${target}.json`)
    await fs.writeFile(outFile, JSON.stringify(out, null, 2) + "\n", "utf-8")
    console.log(`Wrote: ${outFile}`)
  }

  console.log("Done.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

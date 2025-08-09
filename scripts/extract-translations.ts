// Extract static UI strings from your TSX/JSX files into i18n/dictionaries/en.json
// and initialize/merge fr.json and nl.json with blanks for missing keys.
// Also exports a CSV for manual translation.
//
// Usage:
//   npx tsx scripts/extract-translations.ts
//
// Requires dev deps: @babel/parser @babel/traverse @babel/types @types/babel__traverse glob tsx typescript @types/node

import fs from "node:fs"
import path from "node:path"
import { parse } from "@babel/parser"
import traverse, { type NodePath } from "@babel/traverse"
import * as t from "@babel/types"
import { globSync } from "glob"

type Dict = Record<string, string>

const projectRoot = process.cwd()

const translatableJsxAttributes = new Set([
  "alt",
  "title",
  "placeholder",
  "aria-label",
  "aria-description",
  "aria-placeholder",
  "label",
])

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim()
}

function isIgnorable(text: string) {
  const t = text.trim()
  if (!t) return true
  if (/^[\d\s\W]*$/.test(t)) return true
  if (t.length <= 1) return true
  return false
}

type ScopeStrings = Map<string, string>

function resolveIdentifier(name: string, scope: ScopeStrings): string | null {
  return scope.get(name) ?? null
}

function toStaticString(node: t.Node, scope: ScopeStrings): string | null {
  if (t.isStringLiteral(node)) return node.value
  if (t.isTemplateLiteral(node) && node.expressions.length === 0) {
    return node.quasis.map((q) => q.value.cooked ?? q.value.raw).join("")
  }
  if (t.isBinaryExpression(node) && node.operator === "+") {
    const left = toStaticString(node.left, scope)
    const right = toStaticString(node.right, scope)
    if (left !== null && right !== null) return left + right
  }
  if (t.isIdentifier(node)) {
    const val = resolveIdentifier(node.name, scope)
    if (val !== null) return val
  }
  return null
}

function buildScopeStrings(ast: t.File): ScopeStrings {
  const map: ScopeStrings = new Map()
  traverse(ast, {
    VariableDeclarator(p) {
      const id = p.node.id
      const init = p.node.init
      if (!init) return
      if (!t.isIdentifier(id)) return
      const val = toStaticString(init, map)
      if (val !== null) {
        map.set(id.name, val)
      }
    },
  })
  return map
}

function extractFromFile(filePath: string, set: Set<string>) {
  const code = fs.readFileSync(filePath, "utf8")
  let ast: t.File
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: [
        "jsx",
        "typescript",
        "classProperties",
        "decorators-legacy",
        "importMeta",
        "topLevelAwait",
        "dynamicImport",
      ],
    })
  } catch (err: any) {
    console.warn(`! Parse failed: ${path.relative(projectRoot, filePath)} -> ${err?.message || err}`)
    return
  }

  const scopeStrings = buildScopeStrings(ast)

  traverse(ast, {
    JSXText(path: NodePath<t.JSXText>) {
      const raw = path.node.value
      const text = normalize(raw)
      if (!isIgnorable(text)) set.add(text)
    },
    JSXAttribute(path: NodePath<t.JSXAttribute>) {
      const name = (path.node.name as any)?.name as string | undefined
      if (!name || !translatableJsxAttributes.has(name)) return
      const valueNode = path.node.value
      if (!valueNode) return
      if (t.isStringLiteral(valueNode)) {
        const text = normalize(valueNode.value)
        if (!isIgnorable(text)) set.add(text)
      } else if (t.isJSXExpressionContainer(valueNode)) {
        const val = toStaticString(valueNode.expression, scopeStrings)
        if (val !== null) {
          const text = normalize(val)
          if (!isIgnorable(text)) set.add(text)
        }
      }
    },
    JSXExpressionContainer(path: NodePath<t.JSXExpressionContainer>) {
      const val = toStaticString(path.node.expression, scopeStrings)
      if (val !== null) {
        const text = normalize(val)
        if (!isIgnorable(text)) set.add(text)
      }
    },
  })
}

async function main() {
  const files = globSync("**/*.{tsx,jsx}", {
    cwd: projectRoot,
    nodir: true,
    ignore: [
      "node_modules/**",
      ".next/**",
      "scripts/**",
      "i18n/dictionaries/**",
      "**/*.stories.*",
      "**/__tests__/**",
      "**/*.test.*",
      "**/*.spec.*",
      "**/components/ui/**",
      "**/ui/**",
    ],
  })

  console.log(`Scanning ${files.length} files...`)
  const unique = new Set<string>()

  for (const rel of files) {
    const abs = path.join(projectRoot, rel)
    extractFromFile(abs, unique)
  }

  const count = unique.size
  console.log(`Found ${count} unique strings.`)

  const outDir = path.join(projectRoot, "i18n", "dictionaries")
  fs.mkdirSync(outDir, { recursive: true })

  const enDict: Dict = {}
  Array.from(unique)
    .sort((a, b) => a.localeCompare(b))
    .forEach((s) => (enDict[s] = s))

  fs.writeFileSync(path.join(outDir, "en.json"), JSON.stringify(enDict, null, 2), "utf8")

  for (const locale of ["fr", "nl"]) {
    const targetPath = path.join(outDir, `${locale}.json`)
    let existing: Dict = {}
    if (fs.existsSync(targetPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(targetPath, "utf8"))
      } catch {
        existing = {}
      }
    }
    const merged: Dict = {}
    for (const key of Object.keys(enDict)) {
      merged[key] = existing[key] ?? "" // blank = needs translation
    }
    fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2), "utf8")
  }

  // CSV export
  const frDict = JSON.parse(fs.readFileSync(path.join(outDir, "fr.json"), "utf8")) as Dict
  const nlDict = JSON.parse(fs.readFileSync(path.join(outDir, "nl.json"), "utf8")) as Dict
  const csvLines = ["key,en,fr,nl"]
  for (const key of Object.keys(enDict)) {
    const esc = (s: string) => JSON.stringify(s).slice(1, -1)
    csvLines.push(`${JSON.stringify(key)},${esc(enDict[key])},${esc(frDict[key] || "")},${esc(nlDict[key] || "")}`)
  }
  const exportDir = path.join(projectRoot, "i18n", "exports")
  fs.mkdirSync(exportDir, { recursive: true })
  fs.writeFileSync(path.join(exportDir, "translations.csv"), csvLines.join("\n"), "utf8")

  console.log("✓ Wrote:")
  console.log("  - i18n/dictionaries/en.json")
  console.log("  - i18n/dictionaries/fr.json")
  console.log("  - i18n/dictionaries/nl.json")
  console.log("  - i18n/exports/translations.csv")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

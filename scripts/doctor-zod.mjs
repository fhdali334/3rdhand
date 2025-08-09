import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function checkFile(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK)
    return true
  } catch {
    return false
  }
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"))
}

function main() {
  const root = process.cwd()
  const pkgPath = path.join(root, "package.json")
  const pkg = fs.existsSync(pkgPath) ? readJSON(pkgPath) : {}
  const dep = (pkg.dependencies && pkg.dependencies.zod) || (pkg.devDependencies && pkg.devDependencies.zod)
  const override = pkg.overrides && pkg.overrides.zod

  console.log("== zod doctor ==")
  console.log("package.json zod:", dep ?? "(not listed)")
  console.log("package.json overrides.zod:", override ?? "(none)")

  const nm = path.join(root, "node_modules", "zod")
  const libIndex = path.join(nm, "lib", "index.mjs")
  const distIndex = path.join(nm, "dist", "index.mjs")

  const nmExists = fs.existsSync(nm)
  const hasLib = checkFile(libIndex)
  const hasDist = checkFile(distIndex)

  console.log("node_modules/zod exists:", nmExists)
  console.log("zod/lib/index.mjs readable:", hasLib)
  console.log("zod/dist/index.mjs readable:", hasDist)

  if (!nmExists || (!hasLib && !hasDist)) {
    console.log("\nDetected a broken or partial zod install.")
    console.log("Recommended fix:")
    console.log("1) Remove node_modules and lockfile")
    console.log("   - Windows PowerShell:")
    console.log("     rmdir -Recurse -Force node_modules; if (Test-Path package-lock.json) { rm package-lock.json }")
    console.log("   - CMD:")
    console.log("     rmdir /s /q node_modules && del /f /q package-lock.json")
    console.log("2) Clear/verify npm cache: npm cache verify")
    console.log("3) Reinstall with pinned version:")
    console.log("   npm i --save-exact zod@3.24.1")
    console.log("   npm install")
    console.log("4) Verify:")
    console.log("   npm ls zod")
    console.log("   node scripts/doctor-zod.mjs")
  } else {
    console.log("\nzod appears installed. If your app still fails, try:")
    console.log("- Ensure no code imports from 'zod/lib' or deep paths. Use: import { z } from 'zod'")
    console.log("- Deduplicate versions: npm dedupe && npm ls zod")
    console.log("- Clean reinstall steps above if needed.")
  }
}

main()

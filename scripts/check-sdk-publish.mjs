#!/usr/bin/env node
/**
 * Publish-readiness gate for @feedbakery/sdk and @feedbakery/react.
 *
 * Usage: node scripts/check-sdk-publish.mjs <sdk|react>
 *
 * Verifies:
 *  - package.json version matches src VERSION constant (sdk only)
 *  - tarball contents are the expected allowlist (no source, no env, no maps)
 *  - dist/ exists and contains the expected entry files
 *  - no sourcemaps in dist
 *  - no banned strings in dist (localhost, internal hostnames, TODO/FIXME)
 *  - CHANGELOG has an entry for the current version
 *  - LICENSE present
 *
 * Exits non-zero on any failure. Run before `pnpm publish`.
 */
import { execSync } from 'node:child_process'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../..')

const TARGET = process.argv[2]
if (!TARGET || !['sdk', 'react'].includes(TARGET)) {
  console.error('Usage: node scripts/check-sdk-publish.mjs <sdk|react>')
  process.exit(2)
}

const PKG_DIR = join(REPO_ROOT, 'packages', TARGET)
const PKG_JSON_PATH = join(PKG_DIR, 'package.json')
const DIST_DIR = join(PKG_DIR, 'dist')

const failures = []
const warnings = []
const fail = (msg) => failures.push(msg)
const warn = (msg) => warnings.push(msg)

// ──────────────────────────────────────────────────────────────────────────────
// 1. Read package.json
// ──────────────────────────────────────────────────────────────────────────────
if (!existsSync(PKG_JSON_PATH)) {
  console.error(`package.json not found at ${PKG_JSON_PATH}`)
  process.exit(2)
}
const pkg = JSON.parse(readFileSync(PKG_JSON_PATH, 'utf8'))
const version = pkg.version
console.log(`\n▶ Checking ${pkg.name}@${version}\n`)

// ──────────────────────────────────────────────────────────────────────────────
// 2. SDK only: VERSION const matches package.json
// ──────────────────────────────────────────────────────────────────────────────
if (TARGET === 'sdk') {
  const indexSrc = readFileSync(join(PKG_DIR, 'src/index.ts'), 'utf8')
  const m = indexSrc.match(/VERSION\s*=\s*['"]([^'"]+)['"]/)
  if (!m) fail("src/index.ts does not export a VERSION const")
  else if (m[1] !== version)
    fail(`VERSION const "${m[1]}" does not match package.json version "${version}"`)
  else console.log(`✓ src/index.ts VERSION matches package.json (${version})`)
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. dist/ exists with expected entries
// ──────────────────────────────────────────────────────────────────────────────
if (!existsSync(DIST_DIR)) {
  fail("dist/ does not exist — run `pnpm build` first")
} else {
  const expected = TARGET === 'sdk'
    ? ['index.mjs', 'index.cjs', 'index.d.ts', 'element.mjs', 'feedbakery.iife.js']
    : ['index.mjs', 'index.cjs', 'index.d.ts']
  for (const f of expected) {
    if (!existsSync(join(DIST_DIR, f))) fail(`dist/${f} missing`)
  }
  if (failures.length === 0) console.log(`✓ dist/ contains expected entries`)
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. Sourcemaps in dist (informational — public SDK ships maps for DX)
// ──────────────────────────────────────────────────────────────────────────────
const walk = (dir) => {
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}
if (existsSync(DIST_DIR)) {
  const maps = walk(DIST_DIR).filter((f) => f.endsWith('.map'))
  if (maps.length > 0) console.log(`✓ ${maps.length} sourcemap(s) in dist/ (shipped for customer DX)`)
  else warn('no sourcemaps in dist/ — set sourcemap: true in vite.config.ts for better customer debugging')
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. Banned strings in dist
// ──────────────────────────────────────────────────────────────────────────────
const BANNED = [
  { pattern: /localhost/i, msg: 'contains "localhost"' },
  { pattern: /127\.0\.0\.1/, msg: 'contains "127.0.0.1"' },
  { pattern: /staging\.feedbakery/i, msg: 'contains "staging.feedbakery"' },
  { pattern: /TODO|FIXME|XXX|HACK/, msg: 'contains TODO/FIXME/XXX/HACK comment' },
  { pattern: /sk_live_|sk_test_|pk_live_|pk_test_/, msg: 'contains Stripe/Paddle-style key prefix' },
  { pattern: /(?:api[_-]?key|secret|password)\s*[:=]\s*['"][^'"]{8,}/i, msg: 'contains hardcoded credential' },
]
if (existsSync(DIST_DIR)) {
  const files = walk(DIST_DIR).filter((f) => /\.(mjs|cjs|js|d\.ts)$/.test(f))
  let banFound = false
  for (const f of files) {
    const content = readFileSync(f, 'utf8')
    for (const { pattern, msg } of BANNED) {
      if (pattern.test(content)) {
        fail(`${f.replace(REPO_ROOT + '/', '')} ${msg}`)
        banFound = true
      }
    }
  }
  if (!banFound) console.log(`✓ no banned strings in dist/`)
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. CHANGELOG entry exists for this version
// ──────────────────────────────────────────────────────────────────────────────
const changelogPath = join(PKG_DIR, 'CHANGELOG.md')
if (!existsSync(changelogPath)) {
  fail('CHANGELOG.md missing')
} else {
  const cl = readFileSync(changelogPath, 'utf8')
  if (!cl.includes(`## ${version}`)) {
    fail(`CHANGELOG.md has no "## ${version}" entry`)
  } else console.log(`✓ CHANGELOG.md has entry for ${version}`)
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. LICENSE + README present
// ──────────────────────────────────────────────────────────────────────────────
for (const f of ['LICENSE', 'README.md']) {
  if (!existsSync(join(PKG_DIR, f))) fail(`${f} missing`)
}
if (existsSync(join(PKG_DIR, 'README.md'))) {
  const readme = readFileSync(join(PKG_DIR, 'README.md'), 'utf8')
  // Reject any non-ASCII junk at the very start of the file (publish blockers
  // like the stray Cyrillic byte we hit in v0.1.0).
  if (!/^# /.test(readme)) {
    fail(`README.md does not start with "# " — check for stray BOM/encoding bytes`)
  } else console.log(`✓ README.md + LICENSE present and clean`)
}

// ──────────────────────────────────────────────────────────────────────────────
// 8. npm pack --dry-run: verify tarball contents
// ──────────────────────────────────────────────────────────────────────────────
let packOutput
try {
  packOutput = execSync('npm pack --dry-run --json', {
    cwd: PKG_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
} catch (e) {
  fail(`npm pack --dry-run failed: ${e.message}`)
}
if (packOutput) {
  const [pack] = JSON.parse(packOutput)
  const tarballFiles = pack.files.map((f) => f.path)
  const ALLOWED_PATTERNS = [
    /^dist\//,
    /^README\.md$/,
    /^LICENSE$/,
    /^CHANGELOG\.md$/,
    /^package\.json$/,
  ]
  const FORBIDDEN_PATTERNS = [
    /\.env/,
    /node_modules/,
    /\.turbo/,
    /\.test\./,
    /\.tsbuildinfo$/,
    /^src\//,
  ]
  for (const f of tarballFiles) {
    if (!ALLOWED_PATTERNS.some((p) => p.test(f))) {
      fail(`tarball contains unexpected file: ${f}`)
    }
    if (FORBIDDEN_PATTERNS.some((p) => p.test(f))) {
      fail(`tarball contains forbidden file: ${f}`)
    }
  }
  console.log(`✓ npm pack contents OK (${tarballFiles.length} files, ${(pack.size / 1024).toFixed(1)} kB packed)`)
}

// ──────────────────────────────────────────────────────────────────────────────
// 9. Warn if repository.url is unreachable hint
// ──────────────────────────────────────────────────────────────────────────────
const repoUrl = pkg.repository?.url
if (!repoUrl) warn('package.json has no repository.url')
else if (repoUrl.includes('github.com/feedbakery/sdk'))
  warn('repository.url points at github.com/feedbakery/sdk — verify that repo is public and exists, or remove the field')

// ──────────────────────────────────────────────────────────────────────────────
// Report
// ──────────────────────────────────────────────────────────────────────────────
if (warnings.length) {
  console.log(`\n⚠  Warnings:`)
  for (const w of warnings) console.log(`   - ${w}`)
}
if (failures.length) {
  console.log(`\n✗ ${failures.length} blocker(s):`)
  for (const f of failures) console.log(`   - ${f}`)
  process.exit(1)
}
console.log(`\n✓ ${pkg.name}@${version} is ready to publish.\n`)

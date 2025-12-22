/**
 * Merge coverage reports from unit tests and storybook tests
 * Takes the maximum coverage for each file from both reports
 */
import * as fs from 'fs'
import * as path from 'path'

type CoverageMetric = {
  total: number
  covered: number
  skipped: number
  pct: number
}

type FileCoverage = {
  lines: CoverageMetric
  statements: CoverageMetric
  functions: CoverageMetric
  branches: CoverageMetric
}

type CoverageSummary = {
  total: FileCoverage
  [filePath: string]: FileCoverage
}

const coverageDir = path.resolve(process.cwd(), 'coverage')
const unitCoveragePath = path.join(coverageDir, 'unit', 'coverage-summary.json')
const storybookCoveragePath = path.join(coverageDir, 'storybook', 'coverage-summary.json')
const outputPath = path.join(coverageDir, 'coverage-summary.json')

function loadCoverage(filePath: string): CoverageSummary | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

function mergeMetric(a: CoverageMetric, b: CoverageMetric): CoverageMetric {
  // Take the max coverage (more tests = better coverage)
  const total = Math.max(a.total, b.total)
  const covered = Math.max(a.covered, b.covered)
  const skipped = Math.min(a.skipped, b.skipped)
  const pct = total > 0 ? (covered / total) * 100 : 0
  return { total, covered, skipped, pct }
}

function mergeFileCoverage(a: FileCoverage, b: FileCoverage): FileCoverage {
  return {
    lines: mergeMetric(a.lines, b.lines),
    statements: mergeMetric(a.statements, b.statements),
    functions: mergeMetric(a.functions, b.functions),
    branches: mergeMetric(a.branches, b.branches),
  }
}

function mergeCoverages(
  unit: CoverageSummary | null,
  storybook: CoverageSummary | null
): CoverageSummary {
  const merged: CoverageSummary = {
    total: {
      lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
      statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
    },
  }

  // Collect all file paths
  const allFiles = new Set<string>()
  if (unit) {
    Object.keys(unit).forEach((f) => f !== 'total' && allFiles.add(f))
  }
  if (storybook) {
    Object.keys(storybook).forEach((f) => f !== 'total' && allFiles.add(f))
  }

  // Merge each file
  for (const filePath of allFiles) {
    const unitFile = unit?.[filePath]
    const storybookFile = storybook?.[filePath]

    if (unitFile && storybookFile) {
      merged[filePath] = mergeFileCoverage(unitFile, storybookFile)
    } else if (unitFile) {
      merged[filePath] = unitFile
    } else if (storybookFile) {
      merged[filePath] = storybookFile
    }
  }

  // Calculate totals
  let totalLines = 0,
    coveredLines = 0
  let totalStatements = 0,
    coveredStatements = 0
  let totalFunctions = 0,
    coveredFunctions = 0
  let totalBranches = 0,
    coveredBranches = 0

  for (const filePath of Object.keys(merged)) {
    if (filePath === 'total') continue
    const file = merged[filePath]
    totalLines += file.lines.total
    coveredLines += file.lines.covered
    totalStatements += file.statements.total
    coveredStatements += file.statements.covered
    totalFunctions += file.functions.total
    coveredFunctions += file.functions.covered
    totalBranches += file.branches.total
    coveredBranches += file.branches.covered
  }

  merged.total = {
    lines: {
      total: totalLines,
      covered: coveredLines,
      skipped: 0,
      pct: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0,
    },
    statements: {
      total: totalStatements,
      covered: coveredStatements,
      skipped: 0,
      pct: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0,
    },
    functions: {
      total: totalFunctions,
      covered: coveredFunctions,
      skipped: 0,
      pct: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0,
    },
    branches: {
      total: totalBranches,
      covered: coveredBranches,
      skipped: 0,
      pct: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0,
    },
  }

  return merged
}

// Main
const unitCoverage = loadCoverage(unitCoveragePath)
const storybookCoverage = loadCoverage(storybookCoveragePath)

if (!unitCoverage && !storybookCoverage) {
  console.error('No coverage reports found')
  process.exit(1)
}

const merged = mergeCoverages(unitCoverage, storybookCoverage)
fs.mkdirSync(coverageDir, { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2))

console.log(`Merged coverage: ${Math.round(merged.total.lines.pct)}%`)
console.log(`  Lines: ${merged.total.lines.covered}/${merged.total.lines.total}`)
console.log(`  Statements: ${merged.total.statements.covered}/${merged.total.statements.total}`)
console.log(`  Functions: ${merged.total.functions.covered}/${merged.total.functions.total}`)
console.log(`  Branches: ${merged.total.branches.covered}/${merged.total.branches.total}`)

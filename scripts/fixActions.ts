/**
 * Precision fix for action files broken by the nuclear encoding fix.
 * Restores v.replace(/\D/g, "") and similar patterns that got corrupted.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    try {
      if (statSync(full).isDirectory() && !f.startsWith(".") && f !== "node_modules") {
        walk(full).forEach((x) => out.push(x));
      } else if (f.endsWith(".tsx") || f.endsWith(".ts")) {
        out.push(full);
      }
    } catch {}
  }
  return out;
}

let fixed = 0;
for (const f of walk("src")) {
  let content = readFileSync(f, "utf8");
  const original = content;

  // Fix: v.replace(/\D/g, "-") -> v.replace(/\D/g, "")
  // This broke when "\" quote was converted
  content = content.replace(/\.replace\(\/\\D\/g,\s*"-"\)/g, '.replace(/\\D/g, "")');
  content = content.replace(/\.replace\(\/\\D\/g,\s*'"\)/g, '.replace(/\\D/g, "")');

  // Fix unterminated string from replacement gone wrong
  // Pattern: /g, ") -> /g, "")
  content = content.replace(/\/g,\s*"\)\s*\n/g, '/g, ""))\n');
  content = content.replace(/\/g,\s*"\)\s*\./g, '/g, "").');

  // Fix: || "-" that should be || "" (empty string fallback)
  // This is hard to do automatically without context, so we skip it

  if (content !== original) {
    writeFileSync(f, content, "utf8");
    console.log(`FIXED: ${f.replace(process.cwd() + "\\", "")}`);
    fixed++;
  }
}
console.log(`\nFixed ${fixed} files.`);

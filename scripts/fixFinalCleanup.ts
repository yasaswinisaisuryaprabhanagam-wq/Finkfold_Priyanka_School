/**
 * FINAL cleanup - removes extra quote+paren that accumulated from multiple fix passes.
 * Looks for patterns like: ("") -> ("") , or ("") -> ("")
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

  // Fix: ("") -> ("") i.e. extra quote before closing paren
  // This catches useState("")"); -> useState(""); etc.
  content = content.replace(/""\)"(?=[,;)\s])/g, '""');
  content = content.replace(/\(""\)"/g, '("")');

  // Fix: .default("")") -> .default("")
  content = content.replace(/\.default\(""\)"\)/g, '.default("")');
  content = content.replace(/\.default\(""\)"(?=[,;)\s])/g, '.default("")');

  // Fix: ("") -> ("") where there's no closing paren after
  // i.e. the extra ") was added but paren was not
  content = content.replace(/useState\(""\)"(?=[;,\n])/g, 'useState("")');
  content = content.replace(/setError\(""\)"(?=[;,\n])/g, 'setError("")');
  content = content.replace(/setEmail\(""\)"(?=[;,\n])/g, 'setEmail("")');
  content = content.replace(/setPassword\(""\)"(?=[;,\n])/g, 'setPassword("")');

  // Fix bulkImportStudents: .default("")") -> .default("")
  content = content.replace(/\.default\(""\)"(?=\))/g, '.default("")');

  // Generic: any ("") followed by "); or "),  -> ("") + ; or ,
  content = content.replace(/\(""\)"\);/g, '(""));');
  content = content.replace(/\(""\)"\),/g, '("")),');
  content = content.replace(/\(""\)"(?=;)/g, '("")');
  content = content.replace(/\(""\)"(?=,)/g, '("")');
  content = content.replace(/\(""\)"(?=\))/g, '("")');

  if (content !== original) {
    writeFileSync(f, content, "utf8");
    console.log(`FIXED: ${f.replace(process.cwd() + "\\", "")}`);
    fixed++;
  }
}
console.log(`\nFixed ${fixed} files.`);

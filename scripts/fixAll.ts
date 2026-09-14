/**
 * Nuclear encoding fix - fixes ALL remaining broken JSX across the entire codebase
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
      } else if (f.endsWith(".tsx") || (f.endsWith(".ts") && !f.includes("scripts/"))) {
        out.push(full);
      }
    } catch {}
  }
  return out;
}

let totalFixed = 0;

for (const f of walk("src")) {
  let content = readFileSync(f, "utf8");
  const original = content;

  // 1. Remove BOM
  content = content.replace(/^\uFEFF/, "");

  // 2. Smart/curly quotes that ended up in JSX strings breaking TS
  // Pattern: || ""\" -> || "-"
  content = content.replace(/\|\| ""/g, '|| "-"');
  // Pattern: "" in JSX text or string context
  content = content.replace(/""/g, '"');   // left curly quote
  content = content.replace(/""/g, '"');   // right curly quote

  // 3. Corrupted arrow sequences (several variants)
  // â†' = the visible corrupted form of → 
  content = content.replace(/â†'/g, "&rarr;");
  content = content.replace(/\u00e2\u2020\u2019/g, "&rarr;");
  content = content.replace(/â\u2020\u2019/g, "&rarr;");

  // 4. Corrupted star ☆ â˜…
  content = content.replace(/â˜…/g, "*");
  content = content.replace(/\u00e2\u02dc\u2026/g, "*");

  // 5. Corrupted warning âš ï¸
  content = content.replace(/âš\s?ï¸/g, "(!)");

  // 6. Corrupted pencil âœï¸
  content = content.replace(/âœ\s?ï¸/g, "Edit");

  // 7. Remaining ã€€ or other multi-byte leftovers
  content = content.replace(/[\u0080-\u009F]/g, ""); // C1 control chars

  // 8. Fix broken string:  || ""  (double empty string after corruption)
  content = content.replace(/\|\| ""\s*\}/g, '|| "-"}');

  // 9. Fix pattern where empty curly quotes broke string literals in JSX
  // {t.relieved_on ? ... : ""}  -> use "-"
  content = content.replace(/: ""\}/g, ': "-"}');
  content = content.replace(/: "" \}/g, ': "-" }');

  // 10. Fix remaining corrupted middle-dot
  content = content.replace(/Â·/g, "&middot;");

  if (content !== original) {
    writeFileSync(f, content, "utf8");
    console.log(`FIXED: ${f.replace(process.cwd() + "\\", "")}`);
    totalFixed++;
  }
}

console.log(`\nFixed ${totalFixed} files.`);

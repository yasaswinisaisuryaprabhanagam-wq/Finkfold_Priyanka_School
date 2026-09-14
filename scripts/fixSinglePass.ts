/**
 * Single comprehensive pass that fixes ALL remaining encoding issues:
 * 1. "" (left+right curly quote pair) -> "-" (or appropriate replacement)
 * 2. Single dangling " in string context -> ""
 * 3. Trailing " after closing ) -> remove
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

  // Fix 1: "" (U+201C + U+201D curly quote pair) — these are en-dash replacements
  // They appear in time ranges like "08:30 "" 09:15" -> "08:30 – 09:15"
  content = content.replace(/\u201C\u201D/g, "\u2013"); // left+right curly quote -> en-dash
  content = content.replace(/"\u201D/g, "\u2013"); // regular + right curly quote -> en-dash
  content = content.replace(/\u201C"/g, "\u2013"); // left curly + regular quote -> en-dash

  // Fix 2: The "" pattern in metadata/title context
  // title: `... "" ${SCHOOL.name}` -> `... | ${SCHOOL.name}`
  content = content.replace(/ ""\s*\$\{SCHOOL/g, ' | ${SCHOOL');
  content = content.replace(/ ""\s*\$\{school/g, ' | ${school');

  // Fix 3: Remaining single dangling " in function call context (after multiple fix passes)
  // Pattern: ";" -> "";" (empty string)
  // ONLY when preceded by ( and followed by );
  content = content.replace(/\(";$/gm, '("";');  // (";" at end of line

  // Fix 4: window.history.pushState(null, ", newUrl) -> pushState(null, "", newUrl)
  content = content.replace(/pushState\(null, ", /g, 'pushState(null, "", ');

  // Fix 5: Broken setNewPassword(") -> setNewPassword("")
  content = content.replace(/setNewPassword\("(?=[;,)\n])/g, 'setNewPassword("")');
  content = content.replace(/setConfirmPassword\("(?=[;,)\n])/g, 'setConfirmPassword("")');

  // Fix 6: Trailing " at end of string fallback (|| ";) -> || ""
  content = content.replace(/\|\| ";\n/g, '|| "";\n');
  content = content.replace(/ \|\| "(?=;)/g, ' || ""');

  // Fix 7: className broken: "opacity-50" : "} -> "opacity-50" : ""}
  content = content.replace(/"opacity-50" : "\}/g, '"opacity-50" : ""}');

  // Fix 8: template literal ternary broken: ? `...` : "} -> ? `...` : ""}
  content = content.replace(/: "\}(`)/g, ': ""}$1');
  content = content.replace(/: "\}(,|\)|\s*\})/g, ': ""}$1');

  if (content !== original) {
    writeFileSync(f, content, "utf8");
    console.log(`FIXED: ${f.replace(process.cwd() + "\\", "")}`);
    fixed++;
  }
}
console.log(`\nFixed ${fixed} files.`);

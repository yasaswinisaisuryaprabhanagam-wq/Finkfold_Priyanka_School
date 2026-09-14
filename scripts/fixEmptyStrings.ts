/**
 * Precision fix for broken empty string literals.
 * Fixes useState("") -> useState(""), setError("") -> setError(""), value="" -> value=""
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

  // Fix patterns where "" was reduced to " (one double-quote) in specific contexts:

  // useState(") -> useState("")
  content = content.replace(/useState\("(?!\w)/g, 'useState("")');
  // setError(") -> setError("")
  content = content.replace(/setError\("(?!\w)/g, 'setError("")');
  // setEmail(") -> setEmail("")
  content = content.replace(/setEmail\("(?!\w)/g, 'setEmail("")');
  // setPassword(") -> setPassword("")
  content = content.replace(/setPassword\("(?!\w)/g, 'setPassword("")');
  // setMsg(") -> setMsg("")
  content = content.replace(/setMsg\("(?!\w)/g, 'setMsg("")');
  // setSearch(") -> setSearch("")
  content = content.replace(/setSearch\("(?!\w)/g, 'setSearch("")');
  // setFilter(") -> setFilter("")
  content = content.replace(/setFilter\("(?!\w)/g, 'setFilter("")');
  // .default(") -> .default("")
  content = content.replace(/\.default\("(?!\w)/g, '.default("")');
  // value="> -> value="">
  content = content.replace(/value=">/g, 'value="">');
  // value="\n -> value="">\n
  content = content.replace(/value="(\n)/g, 'value="">$1');
  // || "-" where it should be || "" for non-display fallbacks in zod / replace()
  // DON'T touch these - they are actually fine as "-"

  // Fix broken JSX template literal: `} · {"` -> `} · `
  // Pattern: applying_for_section ? `...` : "} ·{" "}` -> : ""} · `
  content = content.replace(/: "\} ·\{" "\}/g, ': ""} \xB7');

  // Fix broken concatenated section line (specific to AdmissionReviewClient)
  content = content.replace(
    /\{admission\.applying_for_section \? `-\$\{admission\.applying_for_section\}` : "\} ·\{" "\}\s*\n\s*Parent:/g,
    '{admission.applying_for_section ? `-${admission.applying_for_section}` : ""} &middot;\n            Parent:'
  );

  // Fix: : "} in template literal context -> : ""}
  content = content.replace(/`\}\s*\{admission\.applying_for_section \? [`]-\$\{admission\.applying_for_section\}[`] : "\}`/g,
    '`}${admission.applying_for_section ? `-${admission.applying_for_section}` : ""}`');

  if (content !== original) {
    writeFileSync(f, content, "utf8");
    console.log(`FIXED: ${f.replace(process.cwd() + "\\", "")}`);
    fixed++;
  }
}
console.log(`\nFixed ${fixed} files.`);

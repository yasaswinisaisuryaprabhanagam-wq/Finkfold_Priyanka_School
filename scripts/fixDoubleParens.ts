/**
 * Final comprehensive encoding fix.
 * Fixes all patterns of broken empty strings from previous repair attempts.
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

  // Fix double-closed patterns like useState("")); -> useState(""));
  // These happen because the fix added "" but the original ) was still there
  // Pattern: ("")) -> ("")
  content = content.replace(/\(""\)\)/g, '("")');

  // Fix setXxx("")); -> setXxx(""); (same issue)
  content = content.replace(/\(""\)\);/g, '(""));');

  // More specific: setError("")); -> setError("");
  content = content.replace(/setError\(""\)\);/g, 'setError("");');
  content = content.replace(/setEmail\(""\)\);/g, 'setEmail("");');
  content = content.replace(/setPassword\(""\)\);/g, 'setPassword("");');
  content = content.replace(/setMsg\(""\)\);/g, 'setMsg("");');
  content = content.replace(/setSearch\(""\)\);/g, 'setSearch("");');
  content = content.replace(/setFilter\(""\)\);/g, 'setFilter("");');
  content = content.replace(/setError\(""\)\)/g, 'setError("")');

  // Fix useState("")); -> useState(""); 
  content = content.replace(/useState\(""\)\);/g, 'useState("");');
  content = content.replace(/useState\(""\)\)/g, 'useState("")');

  // Fix .default("")); -> .default("") (zod)
  content = content.replace(/\.default\(""\)\)/g, '.default("")');

  // Fix value=""> -> value="">  (broken HTML attribute)
  // Already done above but double check: value=""> is correct JSX, value="> is broken
  content = content.replace(/value=">/g, 'value="">');

  // Fix broken template literal in AdmissionReviewClient line 89:
  // `...${...applying_for_section ? `...` : "}` -> `...${...applying_for_section ? `...` : ""}`
  content = content.replace(
    /applying_for_section \? `-\$\{admission\.applying_for_section\}` : "\}`/g,
    'applying_for_section ? `-${admission.applying_for_section}` : ""}\`'
  );

  // Fix broken template literal line 89 variant:
  content = content.replace(
    /: "\}` \},/g,
    ': ""}\` },'
  );

  if (content !== original) {
    writeFileSync(f, content, "utf8");
    console.log(`FIXED: ${f.replace(process.cwd() + "\\", "").replace(process.cwd() + "/", "")}`);
    fixed++;
  }
}
console.log(`\nFixed ${fixed} files.`);

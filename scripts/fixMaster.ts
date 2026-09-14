/**
 * MASTER encoding fix - handles ALL remaining broken patterns in one pass.
 * Runs directly on raw bytes to fix the specific corruption patterns.
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

  // ── Pattern 1: className={... ? "class-name" : "} -> : ""}
  // Broken: "bg-emerald-50/60" : "> and similar
  content = content.replace(/("[\w\/\-\.]+") : "\}/g, '$1 : ""}');

  // ── Pattern 2: ${...} : "} in template literal
  // e.g. applying_for_section}` : "} · -> : ""}
  content = content.replace(/\}` : "\}/g, '}` : ""}');
  content = content.replace(/\}" : "\}/g, '}" : ""}');

  // ── Pattern 3: ternary ending : "} at JSX boundary
  // `...classSection}` : "} -> : ""}
  content = content.replace(/: "\}([^`])/g, ': ""}$1');

  // ── Pattern 4: broken string literal at end of line with "  and nothing after
  // e.g.  = "  ->  = "" 
  content = content.replace(/ = "\s*\n/g, ' = ""\n');

  // ── Pattern 5: consecutive set/useState with single quote
  // setNewPassword(");  -> setNewPassword("");
  // setConfirmPassword(");  -> setConfirmPassword("");
  const setterFns = [
    "setNewPassword", "setConfirmPassword", "setAdminNewPassword", "setAdminConfirmPassword",
    "setTeacherId", "setMsg", "setSearch", "setFilter", "setQuery", "setValue",
  ];
  for (const fn of setterFns) {
    content = content.replace(new RegExp(`${fn}\\("(?=[;,\\n)])`, "g"), `${fn}("")`);
    content = content.replace(new RegExp(`${fn}\\("\\)\\)(?=[;,])`, "g"), `${fn}(""))`);
  }

  // ── Pattern 6: || " at end of statement
  content = content.replace(/\|\| ";\n/g, '|| "";\n');
  content = content.replace(/\|\| "(?=;)/g, '|| ""');

  // ── Pattern 7: ternary in className: ? "x" : "} -> : ""}
  content = content.replace(/\? "([^"]+)" : "\}/g, '? "$1" : ""}');

  // ── Pattern 8: value=" -> value=""  (HTML attribute broken)
  content = content.replace(/value=">(?!\w)/g, 'value="">');

  // ── Pattern 9: defaultValue=" -> defaultValue=""
  content = content.replace(/defaultValue="\s*\n/g, 'defaultValue=""\n');

  // ── Pattern 10: broken string in template literal title/meta:
  // `Teaching Schedule "" ${SCHOOL.name}` -> `Teaching Schedule | ${SCHOOL.name}`
  content = content.replace(/ [""][""]\s*\$\{SCHOOL/g, ' | ${SCHOOL');

  if (content !== original) {
    writeFileSync(f, content, "utf8");
    console.log(`FIXED: ${f.replace(process.cwd() + "\\", "")}`);
    fixed++;
  }
}
console.log(`\nFixed ${fixed} files.`);

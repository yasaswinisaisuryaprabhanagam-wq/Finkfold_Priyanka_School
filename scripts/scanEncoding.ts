import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    try {
      if (statSync(full).isDirectory() && !f.startsWith(".") && f !== "node_modules") {
        walk(full).forEach((x) => files.push(x));
      } else if (f.endsWith(".tsx") || (f.endsWith(".ts") && !f.includes("fixEncoding") && !f.includes("scanEncoding"))) {
        files.push(full);
      }
    } catch {}
  }
  return files;
}

const broken: string[] = [];

for (const f of walk("src")) {
  const content = readFileSync(f, "utf8");
  // These are the Latin-1 interpretations of corrupted UTF-8 multibyte sequences
  if (
    content.includes("\u00e2\u0080\u0094") || // â€" (em dash)
    content.includes("\u00e2\u0086\u0092") || // â†' (arrow)
    content.includes("\u00c3\u0082\u00c2\u00b7") || // Â· (middle dot)
    content.includes("\u00f0\u009f") ||        // ðŸ (emoji start)
    content.includes("â€") ||
    content.includes("âœ") ||
    content.includes("â†") ||
    content.includes("ðŸ") ||
    content.includes("Â·")
  ) {
    broken.push(f.replace(process.cwd() + "\\", "").replace(process.cwd() + "/", ""));
  }
}

if (broken.length === 0) {
  console.log("ALL CLEAN - no encoding issues found across all source files!");
} else {
  console.log(`Still broken: ${broken.length} files`);
  broken.forEach((f) => console.log(`  - ${f}`));
}

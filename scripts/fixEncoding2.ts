/**
 * Definitive encoding fix for remaining files.
 * Handles: BOM, smart quotes in template literals, remaining arrow corruptions.
 */
import { readFileSync, writeFileSync } from "fs";

const files = [
  "src/app/portal/admin/classes/page.tsx",
  "src/app/portal/admin/promotions/page.tsx",
  "src/app/portal/admin/staff/page.tsx",
  "src/app/portal/admin/students/import/page.tsx",
  "src/app/portal/admin/students/page.tsx",
  "src/app/portal/admin/whatsapp/page.tsx",
  "src/app/portal/faculty/students/page.tsx",
];

for (const f of files) {
  let content = readFileSync(f, "utf8");
  const original = content;

  // 1. Remove BOM (U+FEFF)
  content = content.replace(/^\uFEFF/, "");

  // 2. Fix curly/smart quotes used in template literal metadata titles
  //    e.g. `Admin Dashboard \u201C${SCHOOL.name}\u201D` -> backtick string
  content = content.replace(/\u201C/g, '"');   // left double quote -> straight
  content = content.replace(/\u201D/g, '"');   // right double quote -> straight

  // 3. Fix remaining arrow corruption: â†' = 0xE2 0x86 0x92 (→) mangled
  //    Seen as sequence: 0xe2, 0x2020 (dagger), 0x2019 (right single quote)
  //    These 3 unicode points together = the corrupted → arrow
  content = content.replace(/\u00e2\u2020\u2019/g, "&rarr;");
  content = content.replace(/â\u2020\u2019/g, "&rarr;");
  // Also catch the display version
  content = content.replace(/â†'/g, "&rarr;");

  // 4. Fix corrupted ➕ emoji (0xe2 0x17e 0x2022 = mangled ➕)
  content = content.replace(/\u00e2\u017e\u2022/g, "+");
  content = content.replace(/âž•/g, "+");

  // 5. Fix corrupted ⬇️ download arrow (seen in import page)
  content = content.replace(/\u00e2\u00ac\u2021\u00ef\u00b8/g, "Download");
  content = content.replace(/â¬‡ï¸/g, "Download");

  // 6. Fix ordinal indicator º (0xBA) used as a number suffix
  content = content.replace(/\u00ba/g, ".");

  // 7. Fix any remaining non-standard dashes
  content = content.replace(/\u2013/g, "-");  // en dash
  content = content.replace(/\u2014/g, "-");  // em dash

  if (content !== original) {
    writeFileSync(f, content, "utf8");
    console.log(`FIXED: ${f}`);
  } else {
    console.log(`OK (no change): ${f}`);
  }
}

console.log("\nDone.");

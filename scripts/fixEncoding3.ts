import { readFileSync, writeFileSync } from "fs";

const files = [
  "src/app/portal/admin/promotions/page.tsx",
  "src/app/portal/admin/staff/page.tsx",
  "src/app/portal/admin/students/import/page.tsx",
];

for (const f of files) {
  let content = readFileSync(f, "utf8");
  const original = content;

  // Remove BOM
  content = content.replace(/^\uFEFF/, "");
  // Remove Windows-1252 control char 0x8D (reverse line feed)
  content = content.replace(/\u008D/g, "");
  // Fix corrupted ⚠️ warning: â€¢â˜ï¸ -> (!)
  content = content.replace(/\u00e2\u0161\u00a0\u00ef\u00b8\u008f/g, "(!)");
  content = content.replace(/âš\s?ï¸/g, "(!)");
  // Fix corrupted ✏️ pencil: âœï¸ -> Edit
  content = content.replace(/\u00e2\u0153\u008f\u00ef\u00b8\u008f/g, "Edit");
  content = content.replace(/âœ\s?ï¸/g, "Edit");
  // Fix 0x8F standalone (DELETE char)
  content = content.replace(/\u008F/g, "");
  // Fix any remaining high bytes that are garbled
  // eslint-disable-next-line no-control-regex
  content = content.replace(/[\u0080-\u009F]/g, "");

  if (content !== original) {
    writeFileSync(f, content, "utf8");
    console.log(`FIXED: ${f}`);
  } else {
    console.log(`OK: ${f}`);
  }
}
console.log("Done.");

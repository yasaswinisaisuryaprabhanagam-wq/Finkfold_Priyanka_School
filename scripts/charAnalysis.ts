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
  const content = readFileSync(f, "utf8");
  const nonAscii: string[] = [];
  for (let i = 0; i < Math.min(content.length, 5000); i++) {
    const code = content.charCodeAt(i);
    if (code > 127) {
      const ctx = content.substring(Math.max(0, i - 5), Math.min(content.length, i + 10));
      nonAscii.push(`0x${code.toString(16)}@${i}: ${JSON.stringify(ctx)}`);
    }
  }
  if (nonAscii.length > 0) {
    console.log(`\nFile: ${f}`);
    nonAscii.slice(0, 10).forEach((x) => console.log("  " + x));
  } else {
    console.log(`Clean: ${f}`);
  }
}

/**
 * Fix encoding corruption in portal page files.
 * Run: npx tsx scripts/fixEncoding.ts
 *
 * The corruption is: UTF-8 multibyte sequences were stored/read as Latin-1
 * e.g. em dash U+2014 (0xE2 0x80 0x94) becomes â€" in Latin-1 display
 */
import * as fs from "fs";
import * as path from "path";

const filesToFix = [
  "src/app/portal/admin/classes/page.tsx",
  "src/app/portal/admin/admissions/page.tsx",
  "src/app/portal/admin/whatsapp/page.tsx",
  "src/app/portal/admin/staff/page.tsx",
  "src/app/portal/admin/students/page.tsx",
  "src/app/portal/admin/students/import/page.tsx",
  "src/app/portal/admin/staff/allocations/page.tsx",
  "src/app/portal/admin/staff/add/page.tsx",
  "src/app/portal/admin/promotions/page.tsx",
  "src/app/portal/faculty/students/page.tsx",
  "src/app/portal/faculty/schedule/page.tsx",
  "src/app/portal/faculty/messages/page.tsx",
];

// Map of garbled sequences -> clean replacements
const fixes: [RegExp, string][] = [
  // em dash variants
  [/â€"/g, "-"],
  [/â€"/g, "-"],
  // right arrow
  [/â†'/g, "&rarr;"],
  // left arrow
  [/â†"/g, "&larr;"],
  // middle dot / bullet
  [/Â·/g, "&middot;"],
  // checkmark
  [/âœ"/g, "OK"],
  [/âœ…/g, "OK"],
  // warning
  [/âš ï¸/g, "(!)"],
  // copyright
  [/Â©/g, "&copy;"],
  // degree
  [/Â°/g, "&deg;"],
  // left/right quotes
  [/â€™/g, "'"],
  [/â€œ/g, '"'],
  [/â€/g, '"'],
  // box drawing chars
  [/â"€/g, "-"],
  [/â•/g, "="],
  // Emojis - garbled 4-byte sequences starting with 0xF0 in UTF-8, displayed as ð
  [/ðŸ'¥/g, "&#128101;"],  // 👥
  [/ðŸ«/g, "&#127979;"],   // 🏫
  [/ðŸ"‹/g, "&#128203;"],  // 📋
  [/ðŸ'¬/g, "&#128172;"],  // 💬
  [/ðŸ"Š/g, "&#128202;"],  // 📊
  [/ðŸŽ"/g, "&#127891;"],  // 🎓
  [/ðŸ"…/g, "&#128197;"],  // 📅
  [/ðŸ—"ï¸/g, "&#128197;"], // 🗓️
  [/ðŸ"'/g, "&#128274;"],  // 🔒
  [/ðŸ"/g, "&#128269;"],   // 🔍
  [/ðŸ'‹/g, "Hi"],          // 👋
  [/ðŸ"£/g, "&#128227;"],  // 📣
  [/ðŸ"/g, "&#128196;"],   // 📄
  [/ðŸ"ˆ/g, "&#128200;"],  // 📈
  [/ðŸ§'/g, "&#129489;"],  // 🧑
  [/ðŸ"±/g, "&#128241;"],  // 📱
  [/ðŸŒ/g, "&#127757;"],   // 🌍
  [/ðŸ†/g, "&#127942;"],   // 🏆
  [/ðŸ'/g, "&#128079;"],   // 👏
  [/ðŸ•/g, "&#128336;"],   // 🕐
  [/ðŸ§©/g, "&#129513;"],  // 🧩
  [/ðŸ'€/g, "&#128100;"],  // 👀
  [/ðŸ'¨/g, "&#128104;"],  // 👨
  [/ðŸ'©/g, "&#128105;"],  // 👩
  [/ðŸ"'/g, "&#128274;"],  // 🔑
  [/ðŸŸ¢/g, "&#128994;"],  // 🟢
  [/ðŸŸ¡/g, "&#128993;"],  // 🟡
  [/ðŸ"¢/g, "&#128226;"],  // 📢
  [/ðŸ'¾/g, "&#128190;"],  // 💾
  [/ðŸ§ /g, "&#129504;"],  // 🧠
  [/ðŸš€/g, "&#128640;"],  // 🚀
  // catch-all: any remaining ð followed by chars
  [/ðŸ[^<"'\s>{]+/g, ""],
  [/ðŸ/g, ""],
];

let totalFixed = 0;

for (const relPath of filesToFix) {
  const absPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(absPath)) {
    console.log(`SKIP (not found): ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(absPath, "utf8");
  const original = content;

  for (const [pattern, replacement] of fixes) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(absPath, content, "utf8");
    console.log(`FIXED: ${relPath}`);
    totalFixed++;
  } else {
    console.log(`OK (clean): ${relPath}`);
  }
}

console.log(`\nDone. Fixed ${totalFixed} files.`);

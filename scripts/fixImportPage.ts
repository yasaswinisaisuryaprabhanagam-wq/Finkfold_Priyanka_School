import { readFileSync, writeFileSync } from "fs";

const f = "src/app/portal/admin/students/import/page.tsx";
const buf = readFileSync(f);
const hex = buf.toString("hex");
console.log("Around pos 51 in hex (looking for curly quotes):");

// Convert to string and find the desc on line 51
const content = buf.toString("utf8");
const line51 = content.split("\n")[50]; // 0-indexed
console.log("Line 51:", JSON.stringify(line51));

// Check for curly quotes
const hasCurly = /[\u2018\u2019\u201C\u201D]/.test(line51);
console.log("Has curly quotes:", hasCurly);

// Fix: replace all curly quotes with straight quotes in the file
let fixed = content
  .replace(/\u201C/g, '"')  // left double curly quote
  .replace(/\u201D/g, '"')  // right double curly quote  
  .replace(/\u2018/g, "'")  // left single curly quote
  .replace(/\u2019/g, "'"); // right single curly quote

if (fixed !== content) {
  writeFileSync(f, fixed, "utf8");
  console.log("Fixed curly quotes!");
} else {
  console.log("No curly quotes found - checking raw bytes...");
  // Check the byte at position 51
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const code = line.charCodeAt(j);
      if (code > 127) {
        console.log(`Line ${i+1}, col ${j}: char code ${code} (0x${code.toString(16)}) = "${line[j]}"`);
      }
    }
  }
}

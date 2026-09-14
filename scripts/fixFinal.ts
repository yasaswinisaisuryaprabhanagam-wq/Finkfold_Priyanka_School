import { readFileSync, writeFileSync } from "fs";

// Fix staff/add/page.tsx line 62 - broken smart quote in string
const f1 = "src/app/portal/admin/staff/add/page.tsx";
let c1 = readFileSync(f1, "utf8");
// Replace the broken line 62 containing mixed quotes
c1 = c1.replace(
  /\{ n: "2", t: "Account created instantly", d: "No email confirmation needed "[^\n]*\},/,
  '{ n: "2", t: "Account created instantly", d: "No email confirmation needed - login is ready immediately" },'
);
writeFileSync(f1, c1, "utf8");
console.log("Fixed: " + f1);

// Verify TS errors are gone now
console.log("Run: npx tsc --noEmit to verify");

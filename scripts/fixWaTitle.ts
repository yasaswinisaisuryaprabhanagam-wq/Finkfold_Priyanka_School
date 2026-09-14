import { readFileSync, writeFileSync } from "fs";
const f = "src/app/portal/admin/whatsapp/page.tsx";
let c = readFileSync(f, "utf8");
// Fix the title: look for common broken pattern: "WhatsApp Audit Log" followed by broken char
c = c.replace(/WhatsApp Audit Log [^`$]+\$\{SCHOOL\.name\}/, 'WhatsApp Audit Log | ${SCHOOL.name}');
writeFileSync(f, c, "utf8");
console.log("Fixed WhatsApp page title");

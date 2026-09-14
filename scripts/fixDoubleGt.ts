import { readFileSync, writeFileSync } from "fs";

const f = "src/app/portal/admin/admissions/page.tsx";
let c = readFileSync(f, "utf8");
// Fix double > on the tr element
c = c.replace(/"}\u003e\u003e/g, '"}>');
c = c.replace(/"}>>/g, '"}>');
writeFileSync(f, c, "utf8");
console.log("Fixed double >");

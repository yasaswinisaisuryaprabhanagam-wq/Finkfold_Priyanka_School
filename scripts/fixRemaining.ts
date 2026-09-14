import { readFileSync, writeFileSync } from "fs";

// Fix faculty/students/page.tsx line 155
let f = "src/app/portal/faculty/students/page.tsx";
let c = readFileSync(f, "utf8");
// Replace the corrupted emoji badge text
c = c.replace(
  /\{s\.consent_whatsapp \? "â.*?Active" : "Disabled"\}/g,
  '{s.consent_whatsapp ? "Active" : "Disabled"}'
);
writeFileSync(f, c, "utf8");
console.log("Fixed faculty students");

// Fix student/timetable/page.tsx line 82
f = "src/app/portal/student/timetable/page.tsx";
c = readFileSync(f, "utf8");
console.log("timetable sample:", c.slice(3000, 3500));

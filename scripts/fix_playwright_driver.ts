import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const TARGET_VERSION = "1.57.0";
const SOURCE_VERSION = "1.50.1";
const BASE_DIR = path.join(
  process.env.LOCALAPPDATA || "C:\\Users\\YASH\\AppData\\Local",
  "ms-playwright-go"
);
const TARGET_DIR = path.join(BASE_DIR, TARGET_VERSION);
const SOURCE_DIR = path.join(BASE_DIR, SOURCE_VERSION);
const TEMP_DIR = path.join(process.cwd(), ".playwright_temp");

async function setupDriver() {
  console.log(`Setting up Playwright driver for version ${TARGET_VERSION}...`);
  console.log(`Target Dir: ${TARGET_DIR}`);

  // 1. Ensure target dir exists
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  // 2. Copy node.exe and LICENSE from 1.50.1
  const sourceNode = path.join(SOURCE_DIR, "node.exe");
  const targetNode = path.join(TARGET_DIR, "node.exe");
  if (fs.existsSync(sourceNode) && !fs.existsSync(targetNode)) {
    console.log(`Copying node.exe from ${SOURCE_VERSION} to ${TARGET_VERSION}...`);
    fs.copyFileSync(sourceNode, targetNode);
  }

  const sourceLicense = path.join(SOURCE_DIR, "LICENSE");
  const targetLicense = path.join(TARGET_DIR, "LICENSE");
  if (fs.existsSync(sourceLicense) && !fs.existsSync(targetLicense)) {
    console.log(`Copying LICENSE from ${SOURCE_VERSION} to ${TARGET_VERSION}...`);
    fs.copyFileSync(sourceLicense, targetLicense);
  }

  // 3. Install playwright-core@1.57.0 in a temp directory
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  const tempPackageJson = path.join(TEMP_DIR, "package.json");
  if (!fs.existsSync(tempPackageJson)) {
    fs.writeFileSync(tempPackageJson, JSON.stringify({ name: "temp", version: "1.0.0" }));
  }

  console.log(`Installing playwright-core@${TARGET_VERSION} into temp folder...`);
  execSync(`npm install playwright-core@${TARGET_VERSION} --no-save --no-audit`, {
    cwd: TEMP_DIR,
    stdio: "inherit",
  });

  // 4. Copy node_modules/playwright-core to target/package
  const installedPkg = path.join(TEMP_DIR, "node_modules", "playwright-core");
  const targetPackageDir = path.join(TARGET_DIR, "package");

  console.log(`Copying ${installedPkg} to ${targetPackageDir}...`);
  if (fs.existsSync(targetPackageDir)) {
    fs.rmSync(targetPackageDir, { recursive: true, force: true });
  }

  // Recursive copy
  fs.cpSync(installedPkg, targetPackageDir, { recursive: true });

  // 5. Clean up temp dir
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {}

  // 6. Verify installation
  console.log("\nVerifying driver setup...");
  const testNode = path.join(TARGET_DIR, "node.exe");
  const testCli = path.join(TARGET_DIR, "package", "cli.js");

  if (fs.existsSync(testNode) && fs.existsSync(testCli)) {
    console.log(`Found node.exe: ${testNode}`);
    console.log(`Found cli.js: ${testCli}`);
    const output = execSync(`"${testNode}" "${testCli}" --version`, { encoding: "utf8" });
    console.log(`Driver CLI version check output: ${output.trim()}`);
    console.log("\n>>> SUCCESS: Playwright driver 1.57.0 successfully installed and verified!");
  } else {
    throw new Error("Verification failed: missing node.exe or cli.js");
  }
}

setupDriver().catch((err) => {
  console.error("Failed to setup Playwright driver:", err);
  process.exit(1);
});

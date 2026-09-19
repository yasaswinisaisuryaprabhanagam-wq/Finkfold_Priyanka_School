async function checkUrls() {
  const versions = [
    "1.57.0",
    "1.50.0",
    "1.49.1",
    "1.48.0",
    "1.47.0",
    "1.46.0",
    "1.45.0",
    "1.44.0",
    "1.43.0",
    "1.42.1",
    "1.41.2",
    "1.40.1"
  ];

  for (const v of versions) {
    const url = `https://playwright.azureedge.net/builds/driver/playwright-${v}-win32_x64.zip`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`Version ${v}: Status ${res.status}`);
    } catch (e: any) {
      console.log(`Version ${v}: Error ${e.message}`);
    }
  }

  // Also check playwright-core driver URL format:
  // Playwright driver URLs are often:
  // https://playwright.azureedge.net/builds/driver/next/playwright-... or
  // https://playwright.azureedge.net/builds/driver/playwright-...
}

checkUrls();

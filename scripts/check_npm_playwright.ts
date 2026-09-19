async function checkNpm() {
  const url = "https://registry.npmjs.org/playwright-core/-/playwright-core-1.57.0.tgz";
  try {
    const res = await fetch(url, { method: "HEAD" });
    console.log("playwright-core-1.57.0.tgz status:", res.status);
  } catch (e: any) {
    console.log("Error checking npm:", e.message);
  }
}
checkNpm();

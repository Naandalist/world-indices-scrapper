import { chromium } from "playwright";
import userAgents from "user-agents";

async function main() {
  const UA = new userAgents();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: UA.toString() });
  const page = await context.newPage();

  try {
    await page.goto("https://finance.yahoo.com/markets/world-indices/");
    const rows = await page.locator("tbody tr td").allInnerTexts();
    const sanitizedRows = rows.filter((row) => row.trim() !== "");

    if (sanitizedRows.length > 0) {
      const formattedData = [];

      for (let i = 0; i < sanitizedRows.length; i += 5) {
        const [symbolName, price, change, changePercent, volume] = sanitizedRows.slice(i, i + 5);
        const [symbol, name] = symbolName.split('\n');
        const obj = {
          symbol,
          name,
          price,
          change,
          changePercent,
          volume
        };
        formattedData.push(obj);
      }

      const jsonData = JSON.stringify(formattedData, null, 2);
      await Bun.write("world_indices.json", jsonData);
    } else {
      console.log("No data found");
    }

    console.log("done✨");
  } catch (error) {
    console.log("Error occurred:", error);
  }

  await browser.close();
}

main();
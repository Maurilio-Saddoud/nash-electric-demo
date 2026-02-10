import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { createInventoryUrl, inventoryItems } from "../lib/mock-data";

async function run() {
  const baseUrl = process.env.QR_BASE_URL ?? "http://localhost:3000";
  const outputDir = path.resolve(process.cwd(), "qr-output");
  await mkdir(outputDir, { recursive: true });

  const manifestRows = ["truck_id,item_id,part_name,url,file_name"];

  for (const item of inventoryItems) {
    const url = createInventoryUrl(baseUrl, item.truckId, item.id);
    const fileName = `${item.truckId}-${item.id}.png`;
    const filePath = path.join(outputDir, fileName);

    const image = await QRCode.toBuffer(url, {
      width: 600,
      margin: 1,
      color: {
        dark: "#153A6FFF",
        light: "#FFFFFFFF"
      }
    });

    await writeFile(filePath, image);

    manifestRows.push(
      [
        item.truckId,
        item.id,
        `"${item.partName.replaceAll('"', '""')}"`,
        `"${url}"`,
        fileName
      ].join(",")
    );
  }

  await writeFile(path.join(outputDir, "manifest.csv"), `${manifestRows.join("\n")}\n`);
  process.stdout.write(`Generated ${inventoryItems.length} QR codes in ${outputDir}\n`);
}

run().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});

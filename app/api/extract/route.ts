import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import JSZip from "jszip";

export const runtime = "nodejs";

function runTesseract(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "tesseract",
      [imagePath, "stdout", "-l", "eng"],
      { maxBuffer: 1024 * 1024 * 20 },
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
        } else {
          resolve(stdout);
        }
      }
    );
  });
}

function analyzeInvoice(text: string) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const overview: Record<string, string> = {};
  const items: any[] = [];

  for (const line of lines) {
    // Invoice Number
    if (
      !overview["Invoice Number"] &&
      /invoice\s*(no|#)?\s*[:\-]?\s*(\w+)/i.test(line)
    ) {
      overview["Invoice Number"] = line.match(/(\w+)$/)?.[1] || "";
    }

    // Date
    if (
      !overview["Invoice Date"] &&
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(line)
    ) {
      overview["Invoice Date"] =
        line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/)?.[0] || "";
    }

    // Total
    if (
      !overview["Total Amount"] &&
      /(total|amount due|grand total)/i.test(line)
    ) {
      overview["Total Amount"] = normalizeCurrency(
        line.match(/[\$₹€]?\s*[\d,.]+/)?.[0] || ""
      );
    }

    // Vendor
    if (!overview["Vendor"] && /^[A-Z][A-Z\s&]{3,}$/.test(line)) {
      overview["Vendor"] = line;
    }

    // Line item detection (Qty Rate Amount)
    const itemMatch =
      line.match(
        /(.+?)\s+(\d+)\s+([\$₹€]?\d+[.,]\d{2})\s+([\$₹€]?\d+[.,]\d{2})/
      ) || line.match(/(.+?)\s+([\$₹€]?\d+[.,]\d{2})$/);

    if (itemMatch) {
      items.push({
        Description: itemMatch[1],
        Quantity: itemMatch[2] || "",
        Rate: normalizeCurrency(itemMatch[3] || ""),
        Amount: normalizeCurrency(itemMatch[4] || itemMatch[2] || ""),
      });
    }
  }

  return { overview, items, lines };
}

function parseTallyLineItems(lines: string[]) {
  const items: any[] = [];

  for (const line of lines) {
    // Match numeric-heavy rows (Tally style)
    const match = line.match(
      /(.+?)\s+(\d{4,6})\s+(\w+)\s+(\d{2}\/\d{2})\s+(\d+)\s+\d+\s+[\d.]+\s+[\d.]+\s+([\d.]+)\s+(\d+)\s+([\d,.]+)/
    );

    if (match) {
      items.push({
        Product: match[1],
        HSN: match[2],
        Batch: match[3],
        Expiry: match[4],
        Quantity: match[5],
        Rate: match[6],
        Discount: match[7],
        Amount: match[8],
      });
    }
  }

  return items;
}

function normalizeCurrency(value: string) {
  if (!value) return "";
  const number = value.replace(/[^\d.,]/g, "");
  return number.replace(/,/g, "");
}

/* ===== ADD STEP-4 HERE ===== */
function generatePDF(overview: any, items: any[]) {
  const doc = new PDFDocument({ margin: 40 });
  const buffers: Buffer[] = [];

  doc.on("data", buffers.push.bind(buffers));

  doc.fontSize(18).text("Invoice Summary", { underline: true });
  doc.moveDown();

  Object.entries(overview).forEach(([k, v]) => {
    doc.fontSize(12).text(`${k}: ${v}`);
  });

  doc.moveDown().fontSize(16).text("Line Items", { underline: true });
  doc.moveDown();

  items.forEach((item: any) => {
    doc
      .fontSize(11)
      .text(
        `${item.Description} | Qty: ${item.Quantity} | Rate: ${item.Rate} | Amount: ${item.Amount}`
      );
  });

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });
}
/* ===== END STEP-4 ===== */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Save image to temp file
    const bytes = Buffer.from(await image.arrayBuffer());
    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, `${Date.now()}.png`);

    await writeFile(tempPath, bytes);

    console.log("Running OCR...");

    const extractedText = await runTesseract(tempPath);
    await unlink(tempPath);

    const analysis = analyzeInvoice(extractedText);
    const items = parseTallyLineItems(analysis.lines);
    const overview = analysis.overview;
    const lines = analysis.lines;
    const workbook = XLSX.utils.book_new();

    /* ===== Invoice Overview ===== */
    const overviewRows = Object.entries(overview).map(([k, v]) => ({
      Field: k,
      Value: v,
    }));

    const overviewSheet = XLSX.utils.json_to_sheet(overviewRows);
    overviewSheet["!cols"] = [{ wch: 25 }, { wch: 40 }];

    // Bold header
    overviewSheet["A1"].s = { font: { bold: true } };
    overviewSheet["B1"].s = { font: { bold: true } };

    XLSX.utils.book_append_sheet(workbook, overviewSheet, "Invoice Overview");

    /* ===== Line Items ===== */
    if (items.length) {
      const itemsSheet = XLSX.utils.json_to_sheet(items);
      itemsSheet["!cols"] = [
        { wch: 35 }, // Product
        { wch: 10 }, // HSN
        { wch: 10 }, // Batch
        { wch: 10 }, // Exp
        { wch: 10 }, // Qty
        { wch: 15 }, // Rate
        { wch: 10 }, // Disc
        { wch: 15 }, // Amount
      ];
      XLSX.utils.book_append_sheet(workbook, itemsSheet, "Line Items");
    }
    /* ===== Raw OCR ===== */
    const textSheet = XLSX.utils.json_to_sheet(
      lines.map((l, i) => ({ Line: i + 1, Text: l }))
    );
    textSheet["!cols"] = [{ wch: 8 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(workbook, textSheet, "Raw OCR");

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const pdfBuffer = await generatePDF(overview, items);

    const zip = new JSZip();
    zip.file("invoice.xlsx", excelBuffer);
    zip.file("invoice.pdf", pdfBuffer);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="invoice_output.zip"',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}

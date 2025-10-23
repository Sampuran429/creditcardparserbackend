import Tesseract from "tesseract.js";
import fs from "fs-extra";
import path from "path";
import { fromPath } from "pdf2pic";

const tempDir = path.join(process.cwd(), "extracted");

export async function extractTextFromScannedPDF(pdfPath: string): Promise<string> {
  try {
    await fs.ensureDir(tempDir);

    const converter = fromPath(pdfPath, {
      density: 300,
      saveFilename: "ocr_page",
      savePath: tempDir,
      format: "png",
      width: 1200,
      height: 1600,
    });

    const pageImages = await converter.bulk(-1);
    let fullText = "";

    for (const page of pageImages) {
      if(!page.path){
          console.warn(`Skipping page ${page.page ?? "unknown"} — no path found.`);
          continue;
      }
      const imagePath = page.path; 
      const { data: { text } } = await Tesseract.recognize(imagePath, "eng", {
        logger: m => console.log(`OCR Progress: ${(m.progress * 100).toFixed(2)}%`),
      });
      fullText += text + "\n";
    }

    await fs.emptyDir(tempDir);
    return fullText.trim();
  } catch (error: any) {
    console.error("OCR failed:", error.message);
    if (error.message.includes("GraphicsMagick") || error.message.includes("ImageMagick")) {
      throw new Error("GraphicsMagick/ImageMagick not installed. Please install GraphicsMagick or ImageMagick to use OCR functionality.");
    }
    throw error;
  }
}

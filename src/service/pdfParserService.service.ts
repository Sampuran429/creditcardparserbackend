import { extractWithTabula } from "./tabulaService.service";
import { parseFields } from "../utils/parser.utils";
import { IParseResult } from "../utils/parser.utils";
import { IParsedStatement } from "../model/parsedStatement.model";
import fs from "fs";

type ParserResult = {
  rawText: string | null;
  parsedFields?: IParsedStatement["parsedFields"];
  issuer: string | null;
  status: "parsed" | "failed";
  error?: string;
};

/**
 * PDF parsing using **only Tabula**.
 */
export class PDFParserService {
  async parsePDF(filePath: string): Promise<ParserResult> {
    let tables: any[] | null = null;
    let parsedFields: IParsedStatement["parsedFields"] | undefined = undefined;
    let issuer: string | null = null;
    let rawText: string | null = null;

    try {
      // Extract tables using Tabula
      const tabulaData = await extractWithTabula(filePath);
      console.log("tabulaData is -------",tabulaData);
      if (Array.isArray(tabulaData)) tables = tabulaData;
      console.log("tables is -----------",tables);
      // Parse fields from tables
      const parseResult: IParseResult = parseFields(rawText, tables);
      parsedFields = parseResult.fields;
      issuer = parseResult.issuer;

      return {
        rawText,
        parsedFields,
        issuer,
        status: "parsed",
      };
    } catch (e: any) {
      console.error("Tabula extraction failed:", e.message);
      return {
        rawText: null,
        parsedFields: undefined,
        issuer: null,
        status: "failed",
        error: e.message,
      };
    }
  }
}

export default new PDFParserService();














// import statementParserService from "./statementParser.service";
// import { extractWithTabula } from "./tabulaService.service";
// import { extractTextFromScannedPDF } from "./ocrService.service";
// import { parseFields } from "../utils/parser.utils";
// import { IParseResult } from "../utils/parser.utils";
// import { IParsedStatement } from "../model/parsedStatement.model";
// import fs from "fs";


// type ParserResult = {
//   rawText: string | null;
//   parsedFields?: IParsedStatement["parsedFields"];
//   issuer: string | null;
//   status: "parsed" | "failed";
//   error?: string;
// };

// /**
//  * Orchestrates PDF parsing:
//  * 1. Attempt pdf-parse first
//  * 2. Attempt Tabula (tables) if available
//  * 3. Attempt OCR if text is missing or low confidence
//  */
// export class PDFParserService {
//   private confidenceThreshold = 60; // Below this triggers OCR

//   async parsePDF(filePath: string): Promise<ParserResult> {
//     // Step 1: Try pdf-parse
//     const fileBuffer = fs.readFileSync(filePath);
//     console.log("file buffer from pdf service is ",fileBuffer);
//     let { rawText=null, parsedFields, issuer, status, error } =
//       await statementParserService.parse(fileBuffer);

//     let confidence = parsedFields?.confidence || 0;

//     // Step 2: If confidence is low, try Tabula tables
//     let tables: any[] | null = null;
//     if (confidence < this.confidenceThreshold) {
//       try {
//         const tabulaData = await extractWithTabula(filePath);
//         if (Array.isArray(tabulaData)) tables = tabulaData;

//         // Re-run parsing using tables + existing raw text
//         const parseResult: IParseResult = parseFields(rawText ?? null, tables);
//         parsedFields = parseResult.fields;
//         issuer = parseResult.issuer;
//         confidence = parsedFields?.confidence || 0;
//       } catch (e: any) {
//         console.warn("Tabula extraction failed:", e.message);
//       }
//     }

//     // // Step 3: If confidence still low, run OCR
//     // if (confidence < this.confidenceThreshold) {
//     //   try {
//     //     console.log("Running OCR on scanned PDF...");
//     //     const ocrText = await extractTextFromScannedPDF(filePath);

//     //     // Re-run parsing with OCR text
//     //     const parseResult: IParseResult = parseFields(ocrText, tables);
//     //     rawText = ocrText;
//     //     parsedFields = parseResult.fields;
//     //     issuer = parseResult.issuer;
//     //     confidence = parsedFields?.confidence || 0;
//     //   } catch (e: any) {
//     //     console.error("OCR failed:", e.message);
        
//     //     // If OCR fails due to missing GraphicsMagick, return what we have so far
//     //     if (e.message.includes("GraphicsMagick") || e.message.includes("ImageMagick")) {
//     //       console.log("OCR not available, returning results from text extraction and tables");
//     //       return {
//     //         rawText,
//     //         parsedFields,
//     //         issuer,
//     //         status: "parsed", // Still return as parsed with available data
//     //       };
//     //     }
        
//     //     return {
//     //       rawText: null,
//     //       parsedFields: undefined,
//     //       issuer: null,
//     //       status: "failed",
//     //       error: e.message,
//     //     };
//     //   }
//     // }

//     return {
//       rawText,
//       parsedFields,
//       issuer,
//       status: "parsed",
//     };
//   }
// }

// export default new PDFParserService();


// make changes in this file to now just use tabula service instead of pdf parse
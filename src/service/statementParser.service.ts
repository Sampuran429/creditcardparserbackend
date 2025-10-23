import * as pdfParse from "pdf-parse";
const pdf = pdfParse as unknown as (buffer: Buffer) => Promise<any>;
import { IParsedStatement } from "../model/parsedStatement.model";
import { parseFields } from "../utils/parser.utils";

type ParseServiceResult = Pick<IParsedStatement, "rawText" | "parsedFields" | "issuer" | "status" | "error">;

class StatementParserService {
  async parse(fileBuffer: Buffer): Promise<ParseServiceResult> {
    try {
      const data = await pdf(fileBuffer); // ✅ Works with correct import
      console.log("data from statement parser service:", data);

      const text = data.text;
      const { fields, issuer } = parseFields(text, null);

      return {
        rawText: text,
        parsedFields: fields,
        issuer: issuer,
        status: "parsed",
      };
    } catch (error: any) {
      console.error("PDF parsing failed:", error);
      return {
        status: "failed",
        error: error.message || "An unknown error occurred during PDF processing.",
        rawText: null,
        parsedFields: undefined,
        issuer: null,
      };
    }
  }
}

export default new StatementParserService();

import { IParsedFields } from "../model/parsedStatement.model";

export interface IParseResult {
  fields: IParsedFields;
  issuer: string | null;
}

/**
 * Parses raw text and table data from a PDF to extract key financial data points.
 * It uses a series of regular expressions and a confidence score to gauge success.
 * @param text The raw text extracted from the PDF.
 * @param tables An array of table data, if extracted by a tool like Tabula.
 * @returns An object containing the parsed fields and the detected issuer.
 */
export function parseFields(text: string | null, tables: any[] | null): IParseResult {
  const fields: IParsedFields = {
    confidence: 0,
  };
  let issuer: string | null = null;

  // Normalize text to handle different line endings
  const t = (text || "").replace(/\r/g, "\n");

  // 1) Last 4 digits
  // Common patterns: 'ending in 1234', 'xxxx 1234', 'Card Number: XXXX1234', 'Account Number: 12345-67-8907'
  const last4 = t.match(/(?:ending in|ending|Card Number[:\s]*|Card No[:\s]*|Account Number[:\s]*|xxxx|XXXX|·{4,}|\*{4,}|\b)(\d{4})\b/i)
              || t.match(/Account Number[:\s]*\d+-\d+-(\d{4})/i);
  if (last4 && last4[1]) { fields.last4Digits = last4[1]; fields.confidence += 20; }

  // 2) Payment Due Date
  const due = t.match(/(?:Due Date|Payment Due Date|Payment Due)[:\s]*([0-9\/A-Za-z\s]+?)(?:\n|$)/i);
  if (due && due[1]) { 
    fields.paymentDueDate = due[1].trim().split(/\s+/).slice(0, 3).join(' '); // Take only first 3 words
    fields.confidence += 20; 
  }

  // 3) Billing Cycle (e.g., 01 Sep 2025 - 30 Sep 2025) or Opening/Closing Date
  const cycle = t.match(/Billing Cycle[:\s]*([0-9]{1,2} [A-Za-z]{3,9} [0-9]{4})\s*(?:to|-)\s*([0-9]{1,2} [A-Za-z]{3,9} [0-9]{4})/i)
              || t.match(/Opening\/Closing Date[:\s]*([0-9]{1,2}\/[0-9]{1,2}\/[A-Za-z0-9]+)\s*(?:–|-)\s*([0-9]{1,2}\/[0-9]{1,2}\/[A-Za-z0-9]+)/i);
  if (cycle && cycle[1] && cycle[2]) { fields.billingCycle = `${cycle[1]} - ${cycle[2]}`; fields.confidence += 20; }

  // 4) Total Balance / Amount Due
  // Pick common labels and prioritize amounts with decimals
  const balance = t.match(/(?:Total Due|Statement Balance|Amount Due|Total Balance|New Balance)[:\s]*([₹$¥£,0-9]+\.\d{2})/i)
              || t.match(/(?:Total Due|Statement Balance|Amount Due|Total Balance|New Balance)[:\s]*([₹$¥£,0-9]+)/i);
  if (balance && balance[1]) { fields.totalBalance = balance[1]; fields.confidence += 20; }

  // 5) Card variant - look for card types, avoid false positives from document headers
  const variant = t.match(/\b(Platinum|Gold|Classic|Signature|Infinite|Titanium|Visa|Mastercard|Amex|American Express|Credit Card|Debit Card|Rewards|Cashback)\b/i)
              || t.match(/(?:Card Type|Card Variant|Card)[:\s]*(Platinum|Gold|Classic|Signature|Infinite|Titanium|Visa|Mastercard|Amex|American Express|Student|Rewards|Cashback)/i);
  if (variant && variant[1]) { fields.cardVariant = variant[1]; fields.confidence += 10; }

  // 6) Issuer Detection
  if (/HDFC/i.test(t)) issuer = "HDFC Bank";
  else if (/ICICI/i.test(t)) issuer = "ICICI Bank";
  else if (/SBI/i.test(t)) issuer = "SBI Card";
  else if (/Axis/i.test(t)) issuer = "Axis Bank";
  else if (/American Express/i.test(t) || /Amex/i.test(t)) issuer = "American Express";
  else if (/BUILDING BLOCKS/i.test(t)) issuer = "Sample Bank"; // For your sample statement

  // Use tables: if tables supplied, search for known labels inside tables
  if (tables && Array.isArray(tables) && tables.length) {
    // Extract text from Tabula data structure
    let tableText = "";
    tables.forEach(table => {
      if (table.data && Array.isArray(table.data)) {
        table.data.forEach((row: any) => {
          if (Array.isArray(row)) {
            row.forEach(cell => {
              if (cell && cell.text) {
                tableText += cell.text + " ";
              }
            });
            tableText += "\n";
          }
        });
      }
    });

    console.log("Extracted table text:", tableText);

    // Combine with existing text for parsing
    const combinedText = (text || "") + "\n" + tableText;
    
    // Also try to extract specific patterns from the table text directly
    const tableTextLower = tableText.toLowerCase();
    
    // Look for specific patterns in table data
    if (tableTextLower.includes("new balance") && !fields.totalBalance) {
      const newBalanceMatch = tableText.match(/New Balance[:\s]*([$₹¥£,0-9]+\.?\d*)/i);
      if (newBalanceMatch && newBalanceMatch[1]) {
        fields.totalBalance = newBalanceMatch[1];
        fields.confidence += 20;
      }
    }
    
    if (tableTextLower.includes("payment due date") && !fields.paymentDueDate) {
      const dueDateMatch = tableText.match(/Payment Due Date[:\s]*([0-9\/A-Za-z\s]+?)(?:\n|$)/i);
      if (dueDateMatch && dueDateMatch[1]) {
        fields.paymentDueDate = dueDateMatch[1].trim();
        fields.confidence += 20;
      }
    }
    
    if (tableTextLower.includes("account number") && !fields.last4Digits) {
      const accountMatch = tableText.match(/Account Number[:\s]*\d+-\d+-(\d{4})/i);
      if (accountMatch && accountMatch[1]) {
        fields.last4Digits = accountMatch[1];
        fields.confidence += 20;
      }
    }
    
    // Re-run parsing with combined text
    const { fields: tableFields, issuer: tableIssuer } = parseFields(combinedText, null);
    
    console.log("Table fields found:", tableFields);
    
    // Merge results, preferring table results for missing fields
    if (tableFields.last4Digits && !fields.last4Digits) {
      fields.last4Digits = tableFields.last4Digits;
      fields.confidence += 20;
    }
    if (tableFields.paymentDueDate && !fields.paymentDueDate) {
      fields.paymentDueDate = tableFields.paymentDueDate;
      fields.confidence += 20;
    }
    if (tableFields.billingCycle && !fields.billingCycle) {
      fields.billingCycle = tableFields.billingCycle;
      fields.confidence += 20;
    }
    if (tableFields.totalBalance && !fields.totalBalance) {
      fields.totalBalance = tableFields.totalBalance;
      fields.confidence += 20;
    }
    if (tableFields.cardVariant && !fields.cardVariant) {
      fields.cardVariant = tableFields.cardVariant;
      fields.confidence += 10;
    }
    if (tableIssuer && !issuer) {
      issuer = tableIssuer;
    }
  }

  // Cap confidence to 100
  fields.confidence = Math.min(fields.confidence, 100);
  return { fields, issuer };
}

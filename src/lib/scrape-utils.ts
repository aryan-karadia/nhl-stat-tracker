export interface ScrapedTable {
  headers: string[];
  rows: string[][];
}

function stripTags(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function normalizeHeader(value: string): string {
  return decodeHtmlEntities(stripTags(value)).toLowerCase();
}

function normalizeCell(value: string): string {
  return decodeHtmlEntities(stripTags(value));
}

export function extractTablesFromHtml(html: string): ScrapedTable[] {
  const tables: ScrapedTable[] = [];
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch: RegExpExecArray | null;

  while ((tableMatch = tableRegex.exec(html))) {
    const tableHtml = tableMatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rawRows: string[][] = [];
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = rowRegex.exec(tableHtml))) {
      const rowHtml = rowMatch[1];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      const cells: string[] = [];
      let cellMatch: RegExpExecArray | null;

      while ((cellMatch = cellRegex.exec(rowHtml))) {
        cells.push(normalizeCell(cellMatch[1]));
      }

      if (cells.length > 0) {
        rawRows.push(cells);
      }
    }

    if (rawRows.length < 2) {
      continue;
    }

    const headers = rawRows[0].map((h) => normalizeHeader(h));
    const rows = rawRows.slice(1).filter((row) => row.some((cell) => cell.trim().length > 0));
    tables.push({ headers, rows });
  }

  return tables;
}

export function findTableByHeaders(tables: ScrapedTable[], requiredHeaders: string[]): ScrapedTable | null {
  const required = requiredHeaders.map((h) => h.toLowerCase());
  for (const table of tables) {
    const hasAll = required.every((needle) => table.headers.some((header) => header.includes(needle)));
    if (hasAll) {
      return table;
    }
  }
  return null;
}

export function rowToRecord(headers: string[], row: string[]): Record<string, string> {
  const record: Record<string, string> = {};
  for (let i = 0; i < headers.length; i++) {
    record[headers[i]] = row[i] ?? "";
  }
  return record;
}

export function parseCurrencyToNumber(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseIntegerFromText(value: string, fallback = 0): number {
  const match = value.match(/-?\d+/);
  if (!match) {
    return fallback;
  }
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

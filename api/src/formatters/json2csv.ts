import Papa from "papaparse";

function rowsForCsv(parsed: unknown): Record<string, unknown>[] {
  if (Array.isArray(parsed)) {
    return parsed.length === 0 ? [] : (parsed as Record<string, unknown>[]);
  }
  if (parsed && typeof parsed === "object") {
    const o = parsed as Record<string, unknown>;
    const keys = Object.keys(o);
    if (keys.length === 1) {
      const inner = o[keys[0]];
      if (Array.isArray(inner) && inner.length > 0 && typeof inner[0] === "object" && inner[0] !== null) {
        return inner as Record<string, unknown>[];
      }
      if (inner && typeof inner === "object" && !Array.isArray(inner)) {
        const subKeys = Object.keys(inner);
        if (subKeys.length === 1) {
          const rowArr = (inner as Record<string, unknown>)[subKeys[0]];
          if (Array.isArray(rowArr) && rowArr.length > 0 && typeof rowArr[0] === "object" && rowArr[0] !== null) {
            return rowArr as Record<string, unknown>[];
          }
        }
      }
    }
    return [o];
  }
  throw new Error(
    "JSON must be an object for CSV."
  );
}

export function json2csv(input: string): string {
  const parsed = JSON.parse(input);
  const rows = rowsForCsv(parsed);
  return Papa.unparse(rows);
}

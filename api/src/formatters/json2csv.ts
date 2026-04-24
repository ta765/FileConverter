import Papa from "papaparse";

function flattenRowForCsv(row: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};

  function walk(prefix: string, val: unknown): void {
    if (val === null || val === undefined) {
      if (prefix) out[prefix] = "";
      return;
    }
    if (Array.isArray(val)) {
      out[prefix || "value"] = JSON.stringify(val);
      return;
    }
    if (typeof val === "object") {
      const o = val as Record<string, unknown>;
      const keys = Object.keys(o);
      if (keys.length === 0) {
        if (prefix) out[prefix] = "{}";
        return;
      }
      for (const k of keys) {
        const key = prefix ? `${prefix}.${k}` : k;
        walk(key, o[k]);
      }
      return;
    }
    out[prefix || "value"] = String(val);
  }

  walk("", row);
  return out;
}

export function valueToCsv(data: unknown): string {
  const rows = rowsForCsv(data);
  const flatRows = rows.map((r) => flattenRowForCsv(r));
  return Papa.unparse(flatRows);
}

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
  return valueToCsv(JSON.parse(input));
}

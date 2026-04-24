import Papa from "papaparse";
import { XMLBuilder } from "fast-xml-parser";

const builder = new XMLBuilder({ format: true });

export function csv2xml(input: string): string {
  const parsed = Papa.parse<Record<string, string>>(input, {
    header: true,
    skipEmptyLines: true
  });
  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0].message ?? "CSV parse error");
  }
  const rows = parsed.data.filter((row) => Object.keys(row).length > 0);
  const obj = { root: { row: rows } };
  return builder.build(obj);
}

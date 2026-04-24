import Papa from "papaparse";

export function csv2json(input: string): string {
  const parsed = Papa.parse<Record<string, string>>(input, {
    header: true,
    skipEmptyLines: true
  });
  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0].message ?? "CSV parse error");
  }
  return JSON.stringify(parsed.data, null, 2);
}

import { XMLBuilder } from "fast-xml-parser";

const builder = new XMLBuilder({ format: true });

export function json2xml(input: string): string {
  const obj = JSON.parse(input);
  return builder.build(obj);
}

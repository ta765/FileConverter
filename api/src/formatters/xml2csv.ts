import { XMLParser } from "fast-xml-parser";
import { json2csv } from "./json2csv";

const parser = new XMLParser();

export function xml2csv(input: string): string {
  const obj = parser.parse(input);
  return json2csv(JSON.stringify(obj));
}

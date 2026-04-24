export type FormatterAction =
  | "xml2json"
  | "json2xml"
  | "csv2json"
  | "json2csv"
  | "csv2xml"
  | "xml2csv";

export type FormatterFn = (input: string) => string;

import { xml2json } from "./xml2json";
import { json2xml } from "./json2xml";
import { csv2json } from "./csv2json";
import { json2csv } from "./json2csv";
import { csv2xml } from "./csv2xml";
import { xml2csv } from "./xml2csv";

export const FORMATTERS: Record<FormatterAction, FormatterFn> = {
  xml2json,
  json2xml,
  csv2json,
  json2csv,
  csv2xml,
  xml2csv
};

export type FormatterAction = "xml2json" | "json2xml";
export type FormatterFn = (input: string) => string;

import { xml2json } from "./xml2json";
import { json2xml } from "./json2xml";

export const FORMATTERS: Record<FormatterAction, FormatterFn> = {
  xml2json,
  json2xml
};
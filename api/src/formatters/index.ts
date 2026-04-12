export type FormatterAction = "uppercase" | "sentencecase" | "xml2json";
export type FormatterFn = (input: string) => string;

import { uppercase } from "./uppercase";
import { sentencecase } from "./sentencecase";
import { xml2json } from "./xml2json";

export const FORMATTERS: Record<FormatterAction, FormatterFn> = {
  uppercase,
  sentencecase,
  xml2json
};
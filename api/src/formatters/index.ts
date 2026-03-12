import { uppercase } from "./uppercase";
import { sentencecase } from "./sentencecase";

export const FORMATTERS: Record<FormatterAction, FormatterFn>
= {
    uppercase,
    sentencecase
};

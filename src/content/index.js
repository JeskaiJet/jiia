import { enContent } from "./en.js";
import { zhContent } from "./zh.js";

const contentMap = {
  en: enContent,
  zh: zhContent
};

export function getContent(locale) {
  return contentMap[locale] || enContent;
}

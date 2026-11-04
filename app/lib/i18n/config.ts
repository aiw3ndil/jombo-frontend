// Jombo only operates in Finland (jombo.fi).
// Finnish is served at the site root (jombo.fi/...) and English under /en (jombo.fi/en/...).
export const SITE_URL = "https://jombo.fi";
export const SUPPORTED_LANGS = ["fi", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = "fi";

export function normalizeLang(lang?: string | null): Lang {
  return lang === "en" ? "en" : DEFAULT_LANG;
}

/** URL prefix for a language: "" for Finnish, "/en" for English. */
export function langPrefix(lang?: string | null): string {
  return normalizeLang(lang) === DEFAULT_LANG ? "" : `/${lang}`;
}

/** Public path for a page in the given language, e.g. localePath("en", "/search") -> "/en/search". */
export function localePath(lang?: string | null, path: string = ""): string {
  const prefix = langPrefix(lang);
  const cleanPath = path && !path.startsWith("/") ? `/${path}` : path;
  return `${prefix}${cleanPath}` || "/";
}

/** Strips the language prefix from a public path: "/en/search" -> "/search". */
export function stripLangPrefix(pathname: string): string {
  const parts = pathname.split("/");
  if ((SUPPORTED_LANGS as readonly string[]).includes(parts[1])) {
    return `/${parts.slice(2).join("/")}`;
  }
  return pathname || "/";
}

const supportedLocales: Readonly<string[]> = ["en"];

export type AppLocale = (typeof supportedLocales)[number];

export function getAppLocale(): AppLocale {
  const language = navigator.language.split("-")[0]?.toLowerCase();

  if (language && supportedLocales.includes(language as AppLocale)) {
    return language as AppLocale;
  }

  return "en";
}

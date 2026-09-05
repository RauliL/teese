const supportedLocales = ["en", "fi", "id"] as const;

export type AppLocale = (typeof supportedLocales)[number];

export function getAppLocale(): AppLocale {
  const language = navigator.language.split("-")[0]?.toLowerCase();

  if (language && (supportedLocales as readonly string[]).includes(language)) {
    return language as AppLocale;
  }

  return "en";
}

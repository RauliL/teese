const supportedLocales: Readonly<string[]> = ["en", "fi", "id"];
const defaultLocale = "en";

export type AppLocale = (typeof supportedLocales)[number];

export const getAppLocale = (): AppLocale => {
  const language = navigator.language.split("-")[0]?.toLowerCase();

  if (language && (supportedLocales as readonly string[]).includes(language)) {
    return language as AppLocale;
  }

  return defaultLocale;
};

import React, { useMemo } from "react";
import { IntlProvider } from "react-intl";
import { getAppLocale } from "./locale.js";
import { getDefaultMessages } from "./messages.js";

export function AppIntlProvider({ children }: { children: React.ReactNode }) {
  const locale = useMemo(() => getAppLocale(), []);
  const messages = useMemo(() => getDefaultMessages(), []);

  return (
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      {children}
    </IntlProvider>
  );
}

import React, { FunctionComponent, ReactNode, useMemo } from "react";
import { IntlProvider } from "react-intl";
import { getAppLocale } from "./locale.js";
import { getMessagesForLocale } from "./messages.js";

export const AppIntlProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const locale = useMemo(() => getAppLocale(), []);
  const messages = useMemo(() => getMessagesForLocale(locale), [locale]);

  return (
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      {children}
    </IntlProvider>
  );
};

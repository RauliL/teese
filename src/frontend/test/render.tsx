import { type RenderOptions, render } from "@testing-library/react";
import React, { type ReactElement, type ReactNode } from "react";

import { AppIntlProvider } from "../i18n/AppIntlProvider.js";

function AllProviders({ children }: { children: ReactNode }) {
  return <AppIntlProvider>{children}</AppIntlProvider>;
}

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";

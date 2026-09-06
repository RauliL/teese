import { render, type RenderOptions } from "@testing-library/react";
import React, { type ReactElement, type ReactNode } from "react";
import { AppIntlProvider } from "../i18n/AppIntlProvider.js";

function AllProviders({ children }: { children: ReactNode }) {
  return <AppIntlProvider>{children}</AppIntlProvider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";

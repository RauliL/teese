import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { ThemeProvider } from "@mui/material/styles";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.js";
import { AuthProvider } from "./context/AuthContext.js";
import { AppIntlProvider } from "./i18n/AppIntlProvider.js";
import { theme } from "./theme.js";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <>
    <InitColorSchemeScript defaultMode="system" />
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline enableColorScheme />
      <AppIntlProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </AppIntlProvider>
    </ThemeProvider>
  </>,
);

const POST_LOGIN_REDIRECT_KEY: Readonly<string> = "teese.postLoginRedirect";

const isValidRedirectPath = (path: string): boolean =>
  path.startsWith("/") && !path.startsWith("//") && path !== "/login";

export const savePostLoginRedirect = (path: string): void => {
  if (!isValidRedirectPath(path)) {
    return;
  }

  localStorage.setItem(POST_LOGIN_REDIRECT_KEY, path);
};

export const clearPostLoginRedirect = (): void => {
  localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
};

export const resolvePostLoginRedirect = (fallbackPath?: string): string => {
  const storedPath = localStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  if (storedPath && isValidRedirectPath(storedPath)) {
    localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    return storedPath;
  }

  if (fallbackPath && isValidRedirectPath(fallbackPath)) {
    return fallbackPath;
  }

  return "/";
};

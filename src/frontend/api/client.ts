import { JsonObject } from "type-fest";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const TOKEN_STORAGE_KEY: Readonly<string> = "teese.authToken";

export const getStoredToken = (): string | null =>
  localStorage.getItem(TOKEN_STORAGE_KEY);

export const setStoredToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export const apiFetch = async <T extends JsonObject>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      typeof data.error === "string" ? data.error : "Request failed.",
    );
  }

  return data as T;
};

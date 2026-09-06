import { vi } from "vitest";

export const mockFetch = (
  data: unknown,
  status = 200,
): ReturnType<typeof vi.fn> => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

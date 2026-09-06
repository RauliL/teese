import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../context/AuthContext.js";
import { renderWithProviders, screen, waitFor } from "../test/render.js";
import { LoginForm } from "./LoginForm.js";

vi.mock("../context/AuthContext.js", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

describe("LoginForm", () => {
  const login = vi.fn();
  const clearError = vi.fn();

  beforeEach(() => {
    login.mockReset();
    clearError.mockReset();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login,
      logout: vi.fn(),
      clearError,
    });
  });

  it("renders username and password fields", () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^Username/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("submits entered credentials", async () => {
    const user = userEvent.setup();
    login.mockResolvedValue(undefined);

    renderWithProviders(<LoginForm />);

    await user.type(screen.getByRole("textbox", { name: /^Username/ }), "alice");
    await user.type(screen.getByLabelText(/^Password/), "secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(clearError).toHaveBeenCalled();
      expect(login).toHaveBeenCalledWith({
        username: "alice",
        password: "secret",
      });
    });
  });

  it("shows an error message from auth context", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: "Invalid credentials",
      login,
      logout: vi.fn(),
      clearError,
    });

    renderWithProviders(<LoginForm />);

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
  });

  it("disables submit while signing in", async () => {
    const user = userEvent.setup();
    let resolveLogin: (() => void) | undefined;
    login.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve;
        }),
    );

    renderWithProviders(<LoginForm />);

    await user.type(screen.getByRole("textbox", { name: /^Username/ }), "alice");
    await user.type(screen.getByLabelText(/^Password/), "secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      screen.getByRole("button", { name: "Signing in..." }),
    ).toBeDisabled();

    resolveLogin?.();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    });
  });
});

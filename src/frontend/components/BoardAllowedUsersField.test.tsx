import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authApi from "../api/auth.js";
import { ApiError } from "../api/client.js";
import { renderWithProviders, screen } from "../test/render.js";
import { BoardAllowedUsersField } from "./BoardAllowedUsersField.js";

vi.mock("../api/auth.js", () => ({
  listUsers: vi.fn(),
}));

const mockListUsers = vi.mocked(authApi.listUsers);

describe("BoardAllowedUsersField", () => {
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockReset();
    mockListUsers.mockResolvedValue({
      users: [
        { username: "alice", isAdmin: false },
        { username: "bob", isAdmin: true },
      ],
    });
  });

  it("loads users and renders the autocomplete field", async () => {
    renderWithProviders(
      <BoardAllowedUsersField value={[]} onChange={onChange} />,
    );

    expect(await screen.findByLabelText("Allowed users")).toBeInTheDocument();
    expect(mockListUsers).toHaveBeenCalled();
  });

  it("shows selected usernames", async () => {
    renderWithProviders(
      <BoardAllowedUsersField value={["alice"]} onChange={onChange} />,
    );

    expect(await screen.findByText("alice")).toBeInTheDocument();
  });

  it("calls onChange when a user is selected", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <BoardAllowedUsersField value={[]} onChange={onChange} />,
    );

    const input = await screen.findByRole("combobox", { name: /Allowed users/i });
    await user.click(input);
    await user.click(await screen.findByRole("option", { name: "bob" }));

    expect(onChange).toHaveBeenCalledWith(["bob"]);
  });

  it("shows an error when loading users fails", async () => {
    mockListUsers.mockRejectedValue(new ApiError(500, "Server error"));

    renderWithProviders(
      <BoardAllowedUsersField value={[]} onChange={onChange} />,
    );

    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  it("disables the field when the disabled prop is true", async () => {
    renderWithProviders(
      <BoardAllowedUsersField value={[]} onChange={onChange} disabled />,
    );

    await screen.findByRole("combobox", { name: /Allowed users/i });

    expect(screen.getByRole("combobox", { name: /Allowed users/i })).toHaveAttribute(
      "disabled",
    );
  });
});

import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OPEN_FOR_EVERYONE_USERNAME } from "../../types.js";
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

  it("defaults to open for everyone", async () => {
    renderWithProviders(
      <BoardAllowedUsersField
        value={[OPEN_FOR_EVERYONE_USERNAME]}
        onChange={onChange}
      />,
    );

    expect(await screen.findByLabelText("Everyone")).toBeChecked();
    expect(screen.queryByLabelText("Allowed users")).not.toBeInTheDocument();
  });

  it("loads users and renders the selected users field", async () => {
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

    const input = await screen.findByRole("combobox", {
      name: /Allowed users/i,
    });
    await user.click(input);
    await user.click(await screen.findByRole("option", { name: "bob" }));

    expect(onChange).toHaveBeenCalledWith(["bob"]);
  });

  it("calls onChange when switching to everyone", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <BoardAllowedUsersField value={["alice"]} onChange={onChange} />,
    );

    await user.click(await screen.findByLabelText("Everyone"));

    expect(onChange).toHaveBeenCalledWith([OPEN_FOR_EVERYONE_USERNAME]);
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

    expect(
      screen.getByRole("combobox", { name: /Allowed users/i }),
    ).toHaveAttribute("disabled");
  });
});

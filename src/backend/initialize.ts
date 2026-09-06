import { createBoard } from "./boards.js";
import { createUser, hasUsers, isValidUsername } from "./users.js";
import type { Board, PublicUser } from "../types.js";

export type InitializeOptions = {
  username: string;
  password: string;
  boardName: string;
};

export type InitializeResult = {
  user: PublicUser;
  board: Board;
};

export class InitializeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InitializeError";
  }
}

export function validateInitializeInput(
  options: InitializeOptions,
): InitializeOptions {
  const username = options.username.trim();
  const password = options.password;
  const boardName = options.boardName.trim();

  if (!isValidUsername(username)) {
    throw new InitializeError(
      "Username must be a valid slug (lowercase letters, numbers, and hyphens).",
    );
  }

  if (password.length < 8) {
    throw new InitializeError("Password must be at least 8 characters.");
  }

  if (boardName.length === 0) {
    throw new InitializeError("Board name is required.");
  }

  if (boardName.length > 200) {
    throw new InitializeError("Board name must be at most 200 characters.");
  }

  return { username, password, boardName };
}

export async function initializeApplication(
  options: InitializeOptions,
): Promise<InitializeResult> {
  if (await hasUsers()) {
    throw new InitializeError(
      "Teese is already initialized. Users already exist.",
    );
  }

  const validated = validateInitializeInput(options);
  const user = await createUser({
    username: validated.username,
    password: validated.password,
    isAdmin: true,
  });
  const board = await createBoard({ name: validated.boardName });

  return { user, board };
}

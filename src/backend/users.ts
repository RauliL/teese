import bcrypt from "bcryptjs";
import { isValidSlug } from "is-valid-slug";
import type { Board, CreateUserRequest, PublicUser, User } from "../types.js";
import { BOARDS_NAMESPACE } from "./boards.js";
import { storage, USERS_NAMESPACE } from "./storage.js";

const BCRYPT_ROUNDS = 12;

export function isValidUsername(username: string): boolean {
  return isValidSlug(username);
}

export function toPublicUser(user: User): PublicUser {
  return {
    username: user.username,
    isAdmin: user.isAdmin,
  };
}

export async function getUser(username: string): Promise<User | undefined> {
  return storage.get<User>(USERS_NAMESPACE, username);
}

export async function hasUsers(): Promise<boolean> {
  for await (const _entry of storage.entries(USERS_NAMESPACE)) {
    return true;
  }
  return false;
}

export async function listUsers(): Promise<PublicUser[]> {
  const users: PublicUser[] = [];
  for await (const [, value] of storage.entries<User>(USERS_NAMESPACE)) {
    users.push(toPublicUser(value));
  }
  return users.sort((a, b) => a.username.localeCompare(b.username));
}

export async function createUser(
  request: CreateUserRequest,
): Promise<PublicUser> {
  const { username, password, isAdmin = false } = request;

  if (!isValidUsername(username)) {
    throw new UserValidationError(
      "Username must be a valid slug (lowercase letters, numbers, and hyphens).",
    );
  }

  if (password.length < 8) {
    throw new UserValidationError("Password must be at least 8 characters.");
  }

  if (await storage.has(USERS_NAMESPACE, username)) {
    throw new UserValidationError("Username is already taken.");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user: User = { username, passwordHash, isAdmin };

  await storage.set(USERS_NAMESPACE, username, user);
  return toPublicUser(user);
}

export async function verifyUserPassword(
  user: User,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

async function countAdminUsers(): Promise<number> {
  let count = 0;

  for await (const [, user] of storage.entries<User>(USERS_NAMESPACE)) {
    if (user.isAdmin) {
      count++;
    }
  }

  return count;
}

async function removeUserFromBoardAccessLists(
  username: string,
): Promise<void> {
  for await (const [id, board] of storage.entries<Board>(BOARDS_NAMESPACE)) {
    const allowedUsers = board.allowedUsers ?? [];

    if (!allowedUsers.includes(username)) {
      continue;
    }

    await storage.set(BOARDS_NAMESPACE, id, {
      ...board,
      allowedUsers: allowedUsers.filter((entry) => entry !== username),
    });
  }
}

export async function deleteUser(username: string): Promise<void> {
  const user = await getUser(username);

  if (!user) {
    throw new UserNotFoundError();
  }

  if (user.isAdmin && (await countAdminUsers()) <= 1) {
    throw new UserValidationError("Cannot delete the last administrator.");
  }

  await removeUserFromBoardAccessLists(username);
  await storage.delete(USERS_NAMESPACE, username);
}

export class UserValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserValidationError";
  }
}

export class UserNotFoundError extends Error {
  constructor(message = "User not found.") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

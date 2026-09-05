import bcrypt from "bcryptjs";
import { isValidSlug } from "is-valid-slug";
import type { CreateUserRequest, PublicUser, User } from "../types.js";
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

export async function bootstrapAdminIfNeeded(): Promise<void> {
  const username = process.env.TEESE_ADMIN_USERNAME;
  const password = process.env.TEESE_ADMIN_PASSWORD;

  if (!username || !password) {
    return;
  }

  if (await storage.has(USERS_NAMESPACE, username)) {
    return;
  }

  await createUser({ username, password, isAdmin: true });
  console.log(`Created admin user "${username}" from environment variables.`);
}

export class UserValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserValidationError";
  }
}

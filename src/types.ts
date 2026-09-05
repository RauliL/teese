export type User = {
  username: string;
  passwordHash: string;
  isAdmin: boolean;
};

export type PublicUser = {
  username: string;
  isAdmin: boolean;
};

export type AuthTokenPayload = {
  sub: string;
  isAdmin: boolean;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: PublicUser;
};

export type CreateUserRequest = {
  username: string;
  password: string;
  isAdmin?: boolean;
};

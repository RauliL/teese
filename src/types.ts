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

export enum ItemStatus {
  ToDo = "todo",
  InProgress = "in_progress",
  Done = "done",
}

export const ITEM_STATUSES = Object.values(ItemStatus);

export type StatusUpdateHistoryEntry = {
  id: string;
  type: "status_update";
  createdAt: string;
  username: string;
  status: ItemStatus;
};

export type CommentHistoryEntry = {
  id: string;
  type: "comment";
  createdAt: string;
  username: string;
  text: string;
};

export type HistoryEntry = StatusUpdateHistoryEntry | CommentHistoryEntry;

export type Item = {
  id: string;
  title: string;
  createdAt: string;
  status: ItemStatus;
  history: HistoryEntry[];
};

export type Board = {
  id: string;
  name: string;
  createdAt: string;
  allowedUsers: string[];
  items: Item[];
};

export type BoardSummary = {
  id: string;
  name: string;
  createdAt: string;
  itemCount: number;
  allowedUserCount: number;
};

export type CreateBoardRequest = {
  name: string;
  allowedUsers?: string[];
};

export type UpdateBoardRequest = {
  name?: string;
  allowedUsers?: string[];
};

export type CreateItemRequest = {
  title: string;
  status?: ItemStatus;
};

export type UpdateItemRequest = {
  title?: string;
  status?: ItemStatus;
};

export type CreateCommentRequest = {
  text: string;
};

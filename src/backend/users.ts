import { Board, OPEN_FOR_EVERYONE_USERNAME } from "../types.js";
import { BOARDS_NAMESPACE } from "./boards.js";
import { storage } from "./storage.js";

export const removeUserFromBoardAccessLists = async (
  username: string,
): Promise<void> => {
  for await (const [id, board] of storage.entries<Board>(BOARDS_NAMESPACE)) {
    const allowedUsers = board.allowedUsers ?? [];

    if (
      allowedUsers.includes(OPEN_FOR_EVERYONE_USERNAME) ||
      !allowedUsers.includes(username)
    ) {
      continue;
    }

    await storage.set(BOARDS_NAMESPACE, id, {
      ...board,
      allowedUsers: allowedUsers.filter((entry) => entry !== username),
    });
  }
};

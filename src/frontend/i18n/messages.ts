import { defineMessages, type MessageDescriptor } from "react-intl";
import { ItemStatus } from "../../types.js";
import { fiMessages } from "./locales/fi.js";
import { idMessages } from "./locales/id.js";

const rawMessages = defineMessages({
  "app.title": { defaultMessage: "Teese" },
  "app.adminTitle": { defaultMessage: "Teese Admin" },
  "app.admin": { defaultMessage: "Admin" },
  "app.boards": { defaultMessage: "Boards" },
  "app.signOut": { defaultMessage: "Sign out" },
  "app.signIn": { defaultMessage: "Sign in" },
  "app.signingIn": { defaultMessage: "Signing in..." },
  "app.loading": { defaultMessage: "Loading..." },

  "auth.username": { defaultMessage: "Username" },
  "auth.password": { defaultMessage: "Password" },
  "auth.loginFailed": { defaultMessage: "Login failed." },
  "auth.signedInAs": {
    defaultMessage: "Signed in as {username}",
  },

  "nav.dashboard": { defaultMessage: "Dashboard" },
  "nav.manageBoards": { defaultMessage: "Manage boards" },
  "nav.users": { defaultMessage: "Users" },
  "nav.createUser": { defaultMessage: "Create user" },
  "nav.kanbanView": { defaultMessage: "Kanban view" },
  "nav.backToBoards": { defaultMessage: "Back to boards" },
  "nav.backToBoard": { defaultMessage: "Back to board" },
  "nav.backToUsers": { defaultMessage: "Back to users" },

  "kanban.noBoardsAccess": {
    defaultMessage: "You do not have access to any boards yet.",
  },
  "kanban.loadBoardsFailed": { defaultMessage: "Could not load boards." },
  "kanban.newItem": { defaultMessage: "New item" },
  "kanban.newItemPlaceholder": { defaultMessage: "What needs to be done?" },
  "kanban.addToTodo": { defaultMessage: "Add to ToDo" },
  "kanban.createItemFailed": { defaultMessage: "Could not create item." },
  "kanban.moveItemFailed": { defaultMessage: "Could not move item." },
  "kanban.itemCount": {
    defaultMessage: "{count, plural, one {# item} other {# items}}",
  },
  "kanban.deleteDone": { defaultMessage: "Delete all done" },
  "kanban.deleteDoneConfirm": {
    defaultMessage:
      "{count, plural, one {Delete # done item?} other {Delete all # done items?}}",
  },
  "kanban.deleteDoneFailed": {
    defaultMessage: "Could not delete done items.",
  },

  "itemStatus.todo": { defaultMessage: "ToDo" },
  "itemStatus.inProgress": { defaultMessage: "In Progress" },
  "itemStatus.done": { defaultMessage: "Done" },

  "item.details": { defaultMessage: "Item details" },
  "item.title": { defaultMessage: "Title" },
  "item.status": { defaultMessage: "Status" },
  "item.history": { defaultMessage: "History" },
  "item.addComment": { defaultMessage: "Add comment" },
  "item.delete": { defaultMessage: "Delete" },
  "item.cancel": { defaultMessage: "Cancel" },
  "item.close": { defaultMessage: "Close" },
  "item.save": { defaultMessage: "Save" },
  "item.historyStatusUpdate": {
    defaultMessage: "{username} → {status}",
  },
  "item.historyComment": { defaultMessage: "{username} commented" },
  "item.deleteConfirm": {
    defaultMessage: 'Delete item "{title}"?',
  },
  "item.updateFailed": { defaultMessage: "Could not update item." },
  "item.deleteFailed": { defaultMessage: "Could not delete item." },
  "item.addCommentFailed": { defaultMessage: "Could not add comment." },
  "item.notFound": { defaultMessage: "Item not found." },

  "board.name": { defaultMessage: "Board name" },
  "board.accessPolicy": { defaultMessage: "Access policy" },
  "board.accessEveryone": { defaultMessage: "Everyone" },
  "board.accessSelectedUsers": { defaultMessage: "Selected users" },
  "board.accessEveryoneHelp": {
    defaultMessage:
      "All authenticated users can access this board in the kanban UI. Administrators always have access.",
  },
  "board.allowedUsers": { defaultMessage: "Allowed users" },
  "board.allowedUsersHelp": {
    defaultMessage:
      "Only selected users can access this board in the kanban UI. Administrators always have access.",
  },
  "board.loadUsersFailed": { defaultMessage: "Could not load users." },
  "board.create": { defaultMessage: "Create board" },
  "board.creating": { defaultMessage: "Creating..." },
  "board.createFailed": { defaultMessage: "Could not create board." },
  "board.save": { defaultMessage: "Save board" },
  "board.delete": { defaultMessage: "Delete board" },
  "board.deleteConfirm": {
    defaultMessage: 'Delete board "{name}"?',
  },
  "board.deleteFailed": { defaultMessage: "Could not delete board." },
  "board.updateFailed": { defaultMessage: "Could not update board." },
  "board.loadFailed": { defaultMessage: "Could not load board." },
  "board.notFound": { defaultMessage: "Board not found." },
  "board.idMissing": { defaultMessage: "Board id is missing." },
  "board.noBoardsYet": { defaultMessage: "No boards yet." },
  "board.loadBoardsFailed": { defaultMessage: "Could not load boards." },
  "board.created": { defaultMessage: "Created {date}" },
  "board.itemCount": {
    defaultMessage: "{count, plural, one {# item} other {# items}}",
  },
  "board.itemsManagedInKanban": {
    defaultMessage: "Items are managed from the public kanban board UI.",
  },

  "admin.dashboard": { defaultMessage: "Dashboard" },
  "admin.totalUsers": { defaultMessage: "Total users" },
  "admin.administrators": { defaultMessage: "Administrators" },
  "admin.boards": { defaultMessage: "Boards" },
  "admin.loadDashboardFailed": { defaultMessage: "Could not load dashboard." },
  "admin.users": { defaultMessage: "Users" },
  "admin.createUser": { defaultMessage: "Create user" },
  "admin.loadUsersFailed": { defaultMessage: "Could not load users." },
  "admin.roleAdministrator": { defaultMessage: "Administrator" },
  "admin.roleUser": { defaultMessage: "User" },
  "admin.administrator": { defaultMessage: "Administrator" },
  "admin.createUserFailed": { defaultMessage: "Could not create user." },
  "admin.creatingUser": { defaultMessage: "Creating..." },
  "admin.deleteUser": { defaultMessage: "Delete user" },
  "admin.deleteUserConfirm": {
    defaultMessage: 'Delete user "{username}"?',
  },
  "admin.deleteUserFailed": { defaultMessage: "Could not delete user." },

  "table.name": { defaultMessage: "Name" },
  "table.created": { defaultMessage: "Created" },
  "table.users": { defaultMessage: "Users" },
  "table.items": { defaultMessage: "Items" },
  "table.actions": { defaultMessage: "Actions" },
  "table.role": { defaultMessage: "Role" },
  "table.edit": { defaultMessage: "Edit" },
  "table.deleteBoardAria": { defaultMessage: "Delete {name}" },
  "table.deleteUserAria": { defaultMessage: "Delete {username}" },
});

export type MessageKey = keyof typeof rawMessages;

export const messages = Object.fromEntries(
  Object.entries(rawMessages).map(([id, descriptor]) => [
    id,
    { id, ...descriptor },
  ]),
) as Record<MessageKey, MessageDescriptor>;

export const itemStatusMessageKeys: Record<ItemStatus, MessageKey> = {
  [ItemStatus.ToDo]: "itemStatus.todo",
  [ItemStatus.InProgress]: "itemStatus.inProgress",
  [ItemStatus.Done]: "itemStatus.done",
};

export const getDefaultMessages = (): Record<string, string> =>
  Object.fromEntries(
    Object.entries(messages).map(([id, descriptor]) => [
      id,
      descriptor.defaultMessage ?? id,
    ]),
  );

const localeMessages: Record<string, Record<MessageKey, string>> = {
  fi: fiMessages,
  id: idMessages,
};

export const getMessagesForLocale = (
  locale: string,
): Record<string, string> => {
  const defaults = getDefaultMessages();
  const translations = localeMessages[locale];

  if (!translations) {
    return defaults;
  }

  return { ...defaults, ...translations };
};

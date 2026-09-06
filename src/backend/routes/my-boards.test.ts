// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import { ItemStatus } from "../../types.js";
import {
  login,
  request,
  seedAdmin,
  seedRegularUser,
  setupBackendTest,
  withAuth,
  type TestContext,
} from "../test/helpers.js";

describe("my-boards API", () => {
  let context: TestContext;
  let adminToken: string;
  let userToken: string;
  let boardId: string;

  beforeEach(async () => {
    context = await setupBackendTest();
    await seedAdmin(context.createUser);
    await seedRegularUser(context.createUser);
    adminToken = await login(context.app, "admin", "password123");
    userToken = await login(context.app, "alice", "password123");

    const createBoardResponse = await withAuth(context.app, adminToken)
      .post("/api/boards")
      .send({ name: "Team board", allowedUsers: ["alice"] });
    boardId = createBoardResponse.body.board.id as string;
  });

  describe("GET /api/my/boards", () => {
    it("lists boards accessible to the current user", async () => {
      await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Admin only board" });

      const response = await withAuth(context.app, userToken).get(
        "/api/my/boards",
      );

      expect(response.status).toBe(200);
      expect(response.body.boards).toHaveLength(1);
      expect(response.body.boards[0]).toMatchObject({
        id: boardId,
        name: "Team board",
      });
    });

    it("returns all boards for administrators", async () => {
      await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Admin only board" });

      const response = await withAuth(context.app, adminToken).get(
        "/api/my/boards",
      );

      expect(response.status).toBe(200);
      expect(response.body.boards).toHaveLength(2);
    });
  });

  describe("GET /api/my/boards/:id", () => {
    it("returns a board the user can access", async () => {
      const response = await withAuth(context.app, userToken).get(
        `/api/my/boards/${boardId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.board.name).toBe("Team board");
    });

    it("returns 403 for boards the user cannot access", async () => {
      const privateBoardResponse = await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Private board" });
      const privateBoardId = privateBoardResponse.body.board.id as string;

      const response = await withAuth(context.app, userToken).get(
        `/api/my/boards/${privateBoardId}`,
      );

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("You do not have access to this board.");
    });
  });

  describe("item endpoints", () => {
    it("creates, updates, comments on, and deletes items", async () => {
      const createItemResponse = await withAuth(context.app, userToken)
        .post(`/api/my/boards/${boardId}/items`)
        .send({ title: "My task" });

      expect(createItemResponse.status).toBe(201);
      const itemId = createItemResponse.body.board.items[0].id as string;

      const updateItemResponse = await withAuth(context.app, userToken)
        .patch(`/api/my/boards/${boardId}/items/${itemId}`)
        .send({ status: ItemStatus.InProgress });

      expect(updateItemResponse.status).toBe(200);
      expect(updateItemResponse.body.board.items[0].status).toBe(
        ItemStatus.InProgress,
      );

      const commentResponse = await withAuth(context.app, userToken)
        .post(`/api/my/boards/${boardId}/items/${itemId}/comments`)
        .send({ text: "Working on it" });

      expect(commentResponse.status).toBe(201);
      expect(commentResponse.body.board.items[0].history).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "comment",
            text: "Working on it",
            username: "alice",
          }),
        ]),
      );

      const deleteItemResponse = await withAuth(context.app, userToken).delete(
        `/api/my/boards/${boardId}/items/${itemId}`,
      );

      expect(deleteItemResponse.status).toBe(200);
      expect(deleteItemResponse.body.board.items).toEqual([]);
    });

    it("deletes all done items in bulk", async () => {
      const createTodoResponse = await withAuth(context.app, userToken)
        .post(`/api/my/boards/${boardId}/items`)
        .send({ title: "Todo task" });
      const todoItemId = createTodoResponse.body.board.items[0].id as string;

      const createDoneResponse = await withAuth(context.app, userToken)
        .post(`/api/my/boards/${boardId}/items`)
        .send({ title: "Done task", status: ItemStatus.Done });
      const doneItemId = createDoneResponse.body.board.items.find(
        (item: { id: string; status: ItemStatus }) =>
          item.status === ItemStatus.Done,
      ).id as string;

      const deleteDoneResponse = await withAuth(context.app, userToken).delete(
        `/api/my/boards/${boardId}/items/done`,
      );

      expect(deleteDoneResponse.status).toBe(200);
      expect(deleteDoneResponse.body.board.items).toEqual([
        expect.objectContaining({ id: todoItemId, status: ItemStatus.ToDo }),
      ]);
      expect(
        deleteDoneResponse.body.board.items.some(
          (item: { id: string }) => item.id === doneItemId,
        ),
      ).toBe(false);
    });

    it("returns 403 when modifying items on an inaccessible board", async () => {
      const privateBoardResponse = await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Private board" });
      const privateBoardId = privateBoardResponse.body.board.id as string;

      const createItemResponse = await withAuth(context.app, adminToken)
        .post(`/api/boards/${privateBoardId}/items`)
        .send({ title: "Hidden task" });
      const itemId = createItemResponse.body.board.items[0].id as string;

      const response = await withAuth(context.app, userToken)
        .patch(`/api/my/boards/${privateBoardId}/items/${itemId}`)
        .send({ title: "Blocked" });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("You do not have access to this board.");
    });

    it("returns 401 without authentication", async () => {
      const response = await request(context.app)
        .post(`/api/my/boards/${boardId}/items`)
        .send({ title: "Unauthorized task" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Authentication required.");
    });
  });
});

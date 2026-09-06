// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import { ItemStatus } from "../../types.js";
import {
  login,
  seedAdmin,
  seedRegularUser,
  setupBackendTest,
  withAuth,
  type TestContext,
} from "../test/helpers.js";

describe("boards API", () => {
  let context: TestContext;
  let adminToken: string;

  beforeEach(async () => {
    context = await setupBackendTest();
    await seedAdmin(context.createUser);
    await seedRegularUser(context.createUser);
    adminToken = await login(context.app, "admin", "password123");
  });

  describe("GET /api/boards", () => {
    it("lists board summaries", async () => {
      const createResponse = await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Sprint board", allowedUsers: ["alice"] });

      const response = await withAuth(context.app, adminToken).get(
        "/api/boards",
      );

      expect(response.status).toBe(200);
      expect(response.body.boards).toEqual([
        {
          id: createResponse.body.board.id,
          name: "Sprint board",
          createdAt: createResponse.body.board.createdAt,
          itemCount: 0,
          allowedUserCount: 1,
        },
      ]);
    });
  });

  describe("POST /api/boards", () => {
    it("creates a board", async () => {
      const response = await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Roadmap", allowedUsers: ["alice"] });

      expect(response.status).toBe(201);
      expect(response.body.board).toMatchObject({
        name: "Roadmap",
        allowedUsers: ["alice"],
        items: [],
      });
      expect(response.body.board.id).toEqual(expect.any(String));
    });

    it("returns 400 when the board name is missing", async () => {
      const response = await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Board name is required.");
    });

    it("returns 400 for unknown allowed users", async () => {
      const response = await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Roadmap", allowedUsers: ["missing-user"] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User "missing-user" does not exist.');
    });
  });

  describe("GET /api/boards/:id", () => {
    it("returns a board by id", async () => {
      const createResponse = await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Roadmap" });
      const boardId = createResponse.body.board.id as string;

      const response = await withAuth(context.app, adminToken).get(
        `/api/boards/${boardId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.board.name).toBe("Roadmap");
    });

    it("returns 404 for unknown boards", async () => {
      const response = await withAuth(context.app, adminToken).get(
        "/api/boards/missing-board",
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Board not found.");
    });
  });

  describe("PATCH /api/boards/:id", () => {
    it("updates board fields", async () => {
      const createResponse = await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Roadmap" });
      const boardId = createResponse.body.board.id as string;

      const response = await withAuth(context.app, adminToken)
        .patch(`/api/boards/${boardId}`)
        .send({ name: "Renamed board", allowedUsers: ["alice"] });

      expect(response.status).toBe(200);
      expect(response.body.board).toMatchObject({
        id: boardId,
        name: "Renamed board",
        allowedUsers: ["alice"],
      });
    });
  });

  describe("DELETE /api/boards/:id", () => {
    it("deletes a board", async () => {
      const createResponse = await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Roadmap" });
      const boardId = createResponse.body.board.id as string;

      const response = await withAuth(context.app, adminToken).delete(
        `/api/boards/${boardId}`,
      );

      expect(response.status).toBe(204);

      const getResponse = await withAuth(context.app, adminToken).get(
        `/api/boards/${boardId}`,
      );
      expect(getResponse.status).toBe(404);
    });
  });

  describe("board item endpoints", () => {
    it("creates, updates, comments on, and deletes items", async () => {
      const createBoardResponse = await withAuth(context.app, adminToken)
        .post("/api/boards")
        .send({ name: "Roadmap" });
      const boardId = createBoardResponse.body.board.id as string;

      const createItemResponse = await withAuth(context.app, adminToken)
        .post(`/api/boards/${boardId}/items`)
        .send({ title: "First task", status: ItemStatus.ToDo });

      expect(createItemResponse.status).toBe(201);
      const itemId = createItemResponse.body.board.items[0].id as string;

      const updateItemResponse = await withAuth(context.app, adminToken)
        .patch(`/api/boards/${boardId}/items/${itemId}`)
        .send({ title: "Updated task", status: ItemStatus.Done });

      expect(updateItemResponse.status).toBe(200);
      expect(updateItemResponse.body.board.items[0]).toMatchObject({
        id: itemId,
        title: "Updated task",
        status: ItemStatus.Done,
      });

      const commentResponse = await withAuth(context.app, adminToken)
        .post(`/api/boards/${boardId}/items/${itemId}/comments`)
        .send({ text: "Ship it" });

      expect(commentResponse.status).toBe(201);
      expect(commentResponse.body.board.items[0].history).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: "comment", text: "Ship it" }),
        ]),
      );

      const deleteItemResponse = await withAuth(
        context.app,
        adminToken,
      ).delete(`/api/boards/${boardId}/items/${itemId}`);

      expect(deleteItemResponse.status).toBe(200);
      expect(deleteItemResponse.body.board.items).toEqual([]);
    });
  });
});

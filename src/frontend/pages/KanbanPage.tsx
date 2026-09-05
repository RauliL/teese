import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import type { Board } from "../../types.js";
import * as myBoardsApi from "../api/myBoards.js";
import { ApiError } from "../api/client.js";
import { KanbanBoard } from "../components/kanban/KanbanBoard.js";
import { AppLayout } from "../layouts/AppLayout.js";

export function KanbanPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBoards() {
      try {
        const response = await myBoardsApi.listMyBoards();
        if (!cancelled) {
          setBoards(response.boards);
          setSelectedBoardId((current) => {
            if (
              current &&
              response.boards.some((board) => board.id === current)
            ) {
              return current;
            }

            return response.boards[0]?.id ?? null;
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Could not load boards.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBoards();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleBoardUpdated(updatedBoard: Board) {
    setBoards((current) =>
      current.map((board) =>
        board.id === updatedBoard.id ? updatedBoard : board,
      ),
    );
  }

  const selectedBoard =
    boards.find((board) => board.id === selectedBoardId) ?? null;

  return (
    <AppLayout>
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : boards.length === 0 ? (
        <Paper sx={{ p: 4 }}>
          <Typography color="text.secondary">
            You do not have access to any boards yet.
          </Typography>
        </Paper>
      ) : (
        <>
          <Tabs
            value={selectedBoardId ?? false}
            onChange={(_event, boardId: string) => setSelectedBoardId(boardId)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
          >
            {boards.map((board) => (
              <Tab
                key={board.id}
                value={board.id}
                label={board.name}
              />
            ))}
          </Tabs>
          {selectedBoard ? (
            <KanbanBoard
              board={selectedBoard}
              onBoardUpdated={handleBoardUpdated}
            />
          ) : null}
        </>
      )}
    </AppLayout>
  );
}

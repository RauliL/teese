import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Board } from "../../types.js";
import * as myBoardsApi from "../api/myBoards.js";
import { ApiError } from "../api/client.js";
import { KanbanBoard } from "../components/kanban/KanbanBoard.js";
import { useMessages } from "../i18n/useMessages.js";
import { AppLayout } from "../layouts/AppLayout.js";

export const KanbanPage: FunctionComponent = () => {
  const { t } = useMessages();
  const { boardId } = useParams<{ boardId?: string }>();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBoards() {
      try {
        const response = await myBoardsApi.listMyBoards();
        if (!cancelled) {
          setBoards(response.boards);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : t("kanban.loadBoardsFailed"),
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
  }, [t]);

  useEffect(() => {
    if (loading || boards.length === 0 || boardId) {
      return;
    }

    navigate(`/boards/${boards[0].id}`, { replace: true });
  }, [boardId, boards, loading, navigate]);

  function handleBoardUpdated(updatedBoard: Board) {
    setBoards((current) =>
      current.map((board) =>
        board.id === updatedBoard.id ? updatedBoard : board,
      ),
    );
  }

  const selectedBoard = boards.find((board) => board.id === boardId) ?? null;
  const boardNotFound =
    Boolean(boardId) && !loading && boards.length > 0 && !selectedBoard;

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
            {t("kanban.noBoardsAccess")}
          </Typography>
        </Paper>
      ) : (
        <>
          <Tabs
            value={selectedBoard?.id ?? false}
            onChange={(_event, nextBoardId: string) =>
              navigate(`/boards/${nextBoardId}`)
            }
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
          >
            {boards.map((board) => (
              <Tab key={board.id} value={board.id} label={board.name} />
            ))}
          </Tabs>
          {boardNotFound ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {t("board.notFound")}
            </Alert>
          ) : null}
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
};

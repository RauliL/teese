import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import type { Board } from "../../../types.js";
import * as boardsApi from "../../api/boards.js";
import { ApiError } from "../../api/client.js";
import { BoardDetailView } from "./BoardDetailView.js";

export function BoardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBoard() {
      if (!id) {
        setError("Board id is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await boardsApi.getBoard(id);
        if (!cancelled) {
          setBoard(response.board);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load board.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBoard();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !board) {
    return (
      <>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error ?? "Board not found."}
        </Alert>
        <Button component={RouterLink} to="/admin/boards" variant="outlined">
          Back to boards
        </Button>
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography component="h1" variant="h4">
          {board.name}
        </Typography>
        <Button component={RouterLink} to="/admin/boards" variant="outlined">
          Back to boards
        </Button>
      </Box>
      <BoardDetailView
        board={board}
        onBoardUpdated={setBoard}
        onBoardDeleted={() => navigate("/admin/boards")}
      />
    </>
  );
}

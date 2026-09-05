import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { FormEvent, useState } from "react";
import type { Board } from "../../../types.js";
import * as boardsApi from "../../api/boards.js";
import { ApiError } from "../../api/client.js";
import { BoardAllowedUsersField } from "../../components/BoardAllowedUsersField.js";
import { formatDateTime } from "../../utils/formatDateTime.js";

type BoardDetailViewProps = {
  board: Board;
  onBoardUpdated: (board: Board) => void;
  onBoardDeleted: () => void;
};

export function BoardDetailView({
  board,
  onBoardUpdated,
  onBoardDeleted,
}: BoardDetailViewProps) {
  const [name, setName] = useState(board.name);
  const [allowedUsers, setAllowedUsers] = useState(board.allowedUsers);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setName(board.name);
    setAllowedUsers(board.allowedUsers);
  }, [board]);

  async function handleSaveBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { board: updatedBoard } = await boardsApi.updateBoard(board.id, {
        name,
        allowedUsers,
      });
      onBoardUpdated(updatedBoard);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update board.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBoard() {
    if (!window.confirm(`Delete board "${board.name}"?`)) {
      return;
    }

    try {
      await boardsApi.deleteBoard(board.id);
      onBoardDeleted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete board.");
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography color="text.secondary" gutterBottom>
        Created {formatDateTime(board.createdAt)}
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        {board.items.length} item{board.items.length === 1 ? "" : "s"}
      </Typography>
      <Typography color="text.secondary" paragraph>
        Items are managed from the public kanban board UI.
      </Typography>
      <Box component="form" onSubmit={handleSaveBoard}>
        <Stack spacing={2}>
          <TextField
            label="Board name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
          />
          <BoardAllowedUsersField
            value={allowedUsers}
            onChange={setAllowedUsers}
            disabled={submitting}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button type="submit" variant="contained" disabled={submitting}>
              Save board
            </Button>
            <Button
              color="error"
              variant="outlined"
              onClick={() => void handleDeleteBoard()}
            >
              Delete board
            </Button>
          </Stack>
        </Stack>
      </Box>
      {error ? (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      ) : null}
    </Paper>
  );
}

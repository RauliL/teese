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
import { useMessages } from "../../i18n/useMessages.js";
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
  const { t } = useMessages();
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
      setError(
        err instanceof ApiError ? err.message : t("board.updateFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBoard() {
    if (!window.confirm(t("board.deleteConfirm", { name: board.name }))) {
      return;
    }

    try {
      await boardsApi.deleteBoard(board.id);
      onBoardDeleted();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("board.deleteFailed"),
      );
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography color="text.secondary" gutterBottom>
        {t("board.created", { date: formatDateTime(board.createdAt) })}
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        {t("board.itemCount", { count: board.items.length })}
      </Typography>
      <Typography color="text.secondary" paragraph>
        {t("board.itemsManagedInKanban")}
      </Typography>
      <Box component="form" onSubmit={handleSaveBoard}>
        <Stack spacing={2}>
          <TextField
            label={t("board.name")}
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
              {t("board.save")}
            </Button>
            <Button
              color="error"
              variant="outlined"
              onClick={() => void handleDeleteBoard()}
            >
              {t("board.delete")}
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

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, {
  FormEvent,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import type { Board, Item, ItemStatus } from "../../types.js";
import { ITEM_STATUSES } from "../../types.js";
import * as myBoardsApi from "../api/myBoards.js";
import { ApiError } from "../api/client.js";
import { messages } from "../i18n/messages.js";
import { useMessages } from "../i18n/useMessages.js";
import { AppLayout } from "../layouts/AppLayout.js";
import { formatDateTime } from "../utils/formatDateTime.js";

export const KanbanItemPage: FunctionComponent = () => {
  const { t, itemStatusLabel, formatDescriptor } = useMessages();
  const { boardId, itemId } = useParams<{ boardId: string; itemId: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ItemStatus | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBoard() {
      if (!boardId) {
        setError(t("board.idMissing"));
        setLoading(false);
        return;
      }

      try {
        const response = await myBoardsApi.getMyBoard(boardId);
        if (!cancelled) {
          setBoard(response.board);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : t("board.loadFailed"),
          );
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
  }, [boardId, t]);

  const item = board?.items.find((entry) => entry.id === itemId) ?? null;

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setStatus(item.status);
      setComment("");
      setError(null);
    }
  }, [item]);

  const boardPath = boardId ? `/boards/${boardId}` : "/";

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!boardId || !item || status === null) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await myBoardsApi.updateItem(boardId, item.id, { title, status });
      navigate(boardPath);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("item.updateFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!boardId || !item) {
      return;
    }

    if (!window.confirm(t("item.deleteConfirm", { title: item.title }))) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await myBoardsApi.deleteItem(boardId, item.id);
      navigate(boardPath);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("item.deleteFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!boardId || !item) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const { board: updatedBoard } = await myBoardsApi.addItemComment(
        boardId,
        item.id,
        { text: comment },
      );
      setBoard(updatedBoard);
      setComment("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("item.addCommentFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error && !board ? (
        <>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button component={RouterLink} to={boardPath} variant="outlined">
            {t("nav.backToBoard")}
          </Button>
        </>
      ) : !item ? (
        <>
          <Alert severity="warning" sx={{ mb: 3 }}>
            {t("item.notFound")}
          </Alert>
          <Button component={RouterLink} to={boardPath} variant="outlined">
            {t("nav.backToBoard")}
          </Button>
        </>
      ) : (
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
              {t("item.details")}
            </Typography>
            <Button component={RouterLink} to={boardPath} variant="outlined">
              {t("nav.backToBoard")}
            </Button>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Box component="form" id="kanban-item-form" onSubmit={handleSave}>
              <Stack spacing={2}>
                <TextField
                  label={t("item.title")}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  fullWidth
                  disabled={submitting}
                />
                <FormControl fullWidth disabled={submitting}>
                  <InputLabel id="kanban-item-status-label">
                    {t("item.status")}
                  </InputLabel>
                  <Select
                    labelId="kanban-item-status-label"
                    label={t("item.status")}
                    value={status ?? item.status}
                    onChange={(event) =>
                      setStatus(event.target.value as ItemStatus)
                    }
                  >
                    {ITEM_STATUSES.map((entry) => (
                      <MenuItem key={entry} value={entry}>
                        {itemStatusLabel(entry)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
              {t("item.history")}
            </Typography>
            <List dense>
              {[...item.history]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((entry) => (
                  <ListItem key={entry.id} alignItems="flex-start">
                    <ListItemText
                      primary={
                        entry.type === "status_update"
                          ? formatDescriptor(
                              messages["item.historyStatusUpdate"],
                              {
                                username: entry.username,
                                status: itemStatusLabel(entry.status),
                              },
                            )
                          : formatDescriptor(messages["item.historyComment"], {
                              username: entry.username,
                            })
                      }
                      secondary={
                        entry.type === "comment"
                          ? `${formatDateTime(entry.createdAt)} — ${entry.text}`
                          : formatDateTime(entry.createdAt)
                      }
                    />
                  </ListItem>
                ))}
            </List>

            <Box component="form" onSubmit={handleAddComment} sx={{ mt: 2 }}>
              <TextField
                label={t("item.addComment")}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                fullWidth
                multiline
                minRows={2}
                disabled={submitting}
              />
              <Button
                type="submit"
                variant="outlined"
                disabled={submitting || comment.trim().length === 0}
                sx={{ mt: 2 }}
              >
                {t("item.addComment")}
              </Button>
            </Box>

            {error ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            ) : null}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 3 }}
            >
              <Button
                color="error"
                onClick={() => void handleDelete()}
                disabled={submitting}
              >
                {t("item.delete")}
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                component={RouterLink}
                to={boardPath}
                disabled={submitting}
              >
                {t("item.cancel")}
              </Button>
              <Button
                type="submit"
                form="kanban-item-form"
                variant="contained"
                disabled={submitting}
              >
                {t("item.save")}
              </Button>
            </Stack>
          </Paper>
        </>
      )}
    </AppLayout>
  );
};

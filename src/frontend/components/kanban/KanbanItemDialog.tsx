import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
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
import type { Board, Item, ItemStatus } from "../../../types.js";
import { ITEM_STATUSES } from "../../../types.js";
import * as myBoardsApi from "../../api/myBoards.js";
import { ApiError } from "../../api/client.js";
import { messages } from "../../i18n/messages.js";
import { useMessages } from "../../i18n/useMessages.js";
import { formatDateTime } from "../../utils/formatDateTime.js";

type KanbanItemDialogProps = {
  boardId: string;
  item: Item;
  open: boolean;
  onClose: () => void;
  onBoardUpdated: (board: Board) => void;
};

export const KanbanItemDialog: FunctionComponent<KanbanItemDialogProps> = ({
  boardId,
  item,
  open,
  onClose,
  onBoardUpdated,
}) => {
  const { t, itemStatusLabel, formatDescriptor } = useMessages();
  const [title, setTitle] = useState(item.title);
  const [status, setStatus] = useState<ItemStatus>(item.status);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(item.title);
      setStatus(item.status);
      setComment("");
      setError(null);
    }
  }, [open, item]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { board } = await myBoardsApi.updateItem(boardId, item.id, {
        title,
        status,
      });
      onBoardUpdated(board);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("item.updateFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(t("item.deleteConfirm", { title: item.title }))) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { board } = await myBoardsApi.deleteItem(boardId, item.id);
      onBoardUpdated(board);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("item.deleteFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { board } = await myBoardsApi.addItemComment(boardId, item.id, {
        text: comment,
      });
      onBoardUpdated(board);
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("item.details")}</DialogTitle>
      <DialogContent dividers>
        <Box component="form" id="kanban-item-form" onSubmit={handleSave}>
          <Stack spacing={2}>
            <TextField
              label={t("item.title")}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="kanban-item-status-label">
                {t("item.status")}
              </InputLabel>
              <Select
                labelId="kanban-item-status-label"
                label={t("item.status")}
                value={status}
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
                      ? formatDescriptor(messages["item.historyStatusUpdate"], {
                          username: entry.username,
                          status: itemStatusLabel(entry.status),
                        })
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
      </DialogContent>
      <DialogActions>
        <Button
          color="error"
          onClick={() => void handleDelete()}
          disabled={submitting}
        >
          {t("item.delete")}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>{t("item.close")}</Button>
        <Button
          type="submit"
          form="kanban-item-form"
          variant="contained"
          disabled={submitting}
        >
          {t("item.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

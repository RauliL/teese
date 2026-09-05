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
import React, { FormEvent, useEffect, useState } from "react";
import type { Board, Item, ItemStatus } from "../../../types.js";
import {
  ITEM_STATUSES,
  ITEM_STATUS_LABELS,
} from "../../../types.js";
import * as myBoardsApi from "../../api/myBoards.js";
import { ApiError } from "../../api/client.js";
import { formatDateTime } from "../../utils/formatDateTime.js";

type KanbanItemDialogProps = {
  boardId: string;
  item: Item;
  open: boolean;
  onClose: () => void;
  onBoardUpdated: (board: Board) => void;
};

export function KanbanItemDialog({
  boardId,
  item,
  open,
  onClose,
  onBoardUpdated,
}: KanbanItemDialogProps) {
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
      setError(err instanceof ApiError ? err.message : "Could not update item.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete item "${item.title}"?`)) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { board } = await myBoardsApi.deleteItem(boardId, item.id);
      onBoardUpdated(board);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete item.");
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
      setError(err instanceof ApiError ? err.message : "Could not add comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Item details</DialogTitle>
      <DialogContent dividers>
        <Box component="form" id="kanban-item-form" onSubmit={handleSave}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="kanban-item-status-label">Status</InputLabel>
              <Select
                labelId="kanban-item-status-label"
                label="Status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ItemStatus)
                }
              >
                {ITEM_STATUSES.map((entry) => (
                  <MenuItem key={entry} value={entry}>
                    {ITEM_STATUS_LABELS[entry]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
          History
        </Typography>
        <List dense>
          {[...item.history]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((entry) => (
              <ListItem key={entry.id} alignItems="flex-start">
                <ListItemText
                  primary={
                    entry.type === "status_update"
                      ? `${entry.username} → ${ITEM_STATUS_LABELS[entry.status]}`
                      : `${entry.username} commented`
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
            label="Add comment"
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
            Add comment
          </Button>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => void handleDelete()} disabled={submitting}>
          Delete
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>Close</Button>
        <Button
          type="submit"
          form="kanban-item-form"
          variant="contained"
          disabled={submitting}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

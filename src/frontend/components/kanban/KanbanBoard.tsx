import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { FormEvent, useState } from "react";
import type { Board, Item, ItemStatus } from "../../../types.js";
import {
  ITEM_STATUSES,
  ITEM_STATUS_LABELS,
  ItemStatus as ItemStatusEnum,
} from "../../../types.js";
import * as myBoardsApi from "../../api/myBoards.js";
import { ApiError } from "../../api/client.js";
import { KanbanItemDialog } from "./KanbanItemDialog.js";

type KanbanBoardProps = {
  board: Board;
  onBoardUpdated: (board: Board) => void;
};

function itemsForStatus(board: Board, status: ItemStatus): Item[] {
  return board.items.filter((item) => item.status === status);
}

export function KanbanBoard({ board, onBoardUpdated }: KanbanBoardProps) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { board: updatedBoard } = await myBoardsApi.createItem(board.id, {
        title: newItemTitle,
        status: ItemStatusEnum.ToDo,
      });
      onBoardUpdated(updatedBoard);
      setNewItemTitle("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create item.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBoardUpdated(updatedBoard: Board) {
    onBoardUpdated(updatedBoard);
    if (selectedItem) {
      const refreshedItem = updatedBoard.items.find(
        (entry) => entry.id === selectedItem.id,
      );
      setSelectedItem(refreshedItem ?? null);
    }
  }

  return (
    <>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleCreateItem}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="New item"
              value={newItemTitle}
              onChange={(event) => setNewItemTitle(event.target.value)}
              placeholder="What needs to be done?"
              required
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={submitting}>
              Add to ToDo
            </Button>
          </Stack>
        </Box>
        {error ? (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        ) : null}
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        {ITEM_STATUSES.map((status) => {
          const items = itemsForStatus(board, status);

          return (
            <Paper
              key={status}
              variant="outlined"
              sx={{
                p: 2,
                minHeight: 320,
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {ITEM_STATUS_LABELS[status]}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 2 }}
              >
                {items.length} item{items.length === 1 ? "" : "s"}
              </Typography>
              <Stack spacing={1.5}>
                {items.map((item) => (
                  <Card key={item.id} variant="outlined">
                    <CardActionArea onClick={() => setSelectedItem(item)}>
                      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Typography variant="body2">{item.title}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Box>

      {selectedItem ? (
        <KanbanItemDialog
          boardId={board.id}
          item={
            board.items.find((entry) => entry.id === selectedItem.id) ??
            selectedItem
          }
          open={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          onBoardUpdated={handleBoardUpdated}
        />
      ) : null}
    </>
  );
}

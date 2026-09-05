import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
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

function isItemStatus(value: string): value is ItemStatus {
  return ITEM_STATUSES.includes(value as ItemStatus);
}

export function KanbanBoard({ board, onBoardUpdated }: KanbanBoardProps) {
  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);

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

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const previousStatus = source.droppableId;

    if (!isItemStatus(newStatus) || !isItemStatus(previousStatus)) {
      return;
    }

    if (newStatus === previousStatus) {
      return;
    }

    const item = board.items.find((entry) => entry.id === draggableId);

    if (!item || item.status === newStatus) {
      return;
    }

    const previousBoard = board;
    const optimisticBoard: Board = {
      ...board,
      items: board.items.map((entry) =>
        entry.id === draggableId ? { ...entry, status: newStatus } : entry,
      ),
    };

    setError(null);
    setMovingItemId(draggableId);
    onBoardUpdated(optimisticBoard);

    try {
      const { board: updatedBoard } = await myBoardsApi.updateItem(
        board.id,
        draggableId,
        { status: newStatus },
      );
      onBoardUpdated(updatedBoard);
    } catch (err) {
      onBoardUpdated(previousBoard);
      setError(err instanceof ApiError ? err.message : "Could not move item.");
    } finally {
      setMovingItemId(null);
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
              disabled={Boolean(movingItemId)}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || Boolean(movingItemId)}
            >
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

      <DragDropContext onDragEnd={(result) => void handleDragEnd(result)}>
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
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      minHeight: 320,
                      bgcolor: snapshot.isDraggingOver
                        ? "action.hover"
                        : "background.paper",
                      transition: "background-color 0.2s ease",
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
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 200,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                          isDragDisabled={movingItemId === item.id}
                        >
                          {(draggableProvided, draggableSnapshot) => (
                            <Box
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              {...draggableProvided.dragHandleProps}
                              sx={{
                                touchAction: "none",
                                cursor: draggableSnapshot.isDragging
                                  ? "grabbing"
                                  : "grab",
                                opacity:
                                  movingItemId === item.id ? 0.6 : 1,
                              }}
                            >
                              <Card
                                variant="outlined"
                                sx={{
                                  boxShadow: draggableSnapshot.isDragging
                                    ? 4
                                    : 0,
                                }}
                                onClick={() => setSelectedItem(item)}
                              >
                                <CardContent
                                  sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                                >
                                  <Typography variant="body2">
                                    {item.title}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  </Paper>
                )}
              </Droppable>
            );
          })}
        </Box>
      </DragDropContext>

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

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
import React, { FormEvent, FunctionComponent, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Board, Item, ItemStatus } from "../../../types.js";
import { ITEM_STATUSES, ItemStatus as ItemStatusEnum } from "../../../types.js";
import * as myBoardsApi from "../../api/myBoards.js";
import { ApiError } from "../../api/client.js";
import { useMessages } from "../../i18n/useMessages.js";

type KanbanBoardProps = {
  board: Board;
  onBoardUpdated: (board: Board) => void;
};

const itemsForStatus = (board: Board, status: ItemStatus): Item[] =>
  board.items.filter((item) => item.status === status);

const isItemStatus = (value: string): value is ItemStatus =>
  ITEM_STATUSES.includes(value as ItemStatus);

export const KanbanBoard: FunctionComponent<KanbanBoardProps> = ({
  board,
  onBoardUpdated,
}) => {
  const { t, itemStatusLabel } = useMessages();
  const navigate = useNavigate();
  const [newItemTitle, setNewItemTitle] = useState("");
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
      setError(
        err instanceof ApiError ? err.message : t("kanban.createItemFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteDoneItems() {
    const doneItems = itemsForStatus(board, ItemStatusEnum.Done);

    if (doneItems.length === 0) {
      return;
    }

    if (
      !window.confirm(
        t("kanban.deleteDoneConfirm", { count: doneItems.length }),
      )
    ) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const { board: updatedBoard } = await myBoardsApi.deleteDoneItems(
        board.id,
      );
      onBoardUpdated(updatedBoard);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("kanban.deleteDoneFailed"),
      );
    } finally {
      setSubmitting(false);
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
      setError(
        err instanceof ApiError ? err.message : t("kanban.moveItemFailed"),
      );
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
              label={t("kanban.newItem")}
              value={newItemTitle}
              onChange={(event) => setNewItemTitle(event.target.value)}
              placeholder={t("kanban.newItemPlaceholder")}
              required
              fullWidth
              disabled={Boolean(movingItemId)}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || Boolean(movingItemId)}
            >
              {t("kanban.addToTodo")}
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
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      gutterBottom
                    >
                      {itemStatusLabel(status)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 2 }}
                    >
                      {t("kanban.itemCount", { count: items.length })}
                    </Typography>
                    {status === ItemStatusEnum.Done && items.length > 0 ? (
                      <Button
                        color="error"
                        size="small"
                        onClick={() => void handleDeleteDoneItems()}
                        disabled={submitting || Boolean(movingItemId)}
                        sx={{ mb: 2 }}
                      >
                        {t("kanban.deleteDone")}
                      </Button>
                    ) : null}
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
                                opacity: movingItemId === item.id ? 0.6 : 1,
                              }}
                            >
                              <Card
                                variant="outlined"
                                sx={{
                                  boxShadow: draggableSnapshot.isDragging
                                    ? 4
                                    : 0,
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  navigate(
                                    `/boards/${board.id}/items/${item.id}`,
                                  )
                                }
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
    </>
  );
};

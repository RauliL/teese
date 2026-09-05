import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import * as boardsApi from "../../api/boards.js";
import { ApiError } from "../../api/client.js";
import { BoardAllowedUsersField } from "../../components/BoardAllowedUsersField.js";

export function CreateBoardPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { board } = await boardsApi.createBoard({ name, allowedUsers });
      navigate(`/admin/boards/${board.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create board.");
    } finally {
      setSubmitting(false);
    }
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
          Create board
        </Typography>
        <Button component={RouterLink} to="/admin/boards" variant="outlined">
          Back to boards
        </Button>
      </Box>
      <Paper sx={{ p: 3, maxWidth: 640 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              id="board-name"
              label="Board name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
              autoFocus
            />
            <BoardAllowedUsersField
              value={allowedUsers}
              onChange={setAllowedUsers}
              disabled={submitting}
            />
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Creating..." : "Create board"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </>
  );
}

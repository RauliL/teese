import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { BoardSummary } from "../../../types.js";
import * as boardsApi from "../../api/boards.js";
import { ApiError } from "../../api/client.js";
import { useMessages } from "../../i18n/useMessages.js";
import { formatDateTime } from "../../utils/formatDateTime.js";

export function BoardsPage() {
  const { t } = useMessages();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadBoards() {
    setLoading(true);
    setError(null);

    try {
      const response = await boardsApi.listBoards();
      setBoards(response.boards);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("board.loadBoardsFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBoards();
  }, []);

  async function handleDelete(board: BoardSummary) {
    if (!window.confirm(t("board.deleteConfirm", { name: board.name }))) {
      return;
    }

    try {
      await boardsApi.deleteBoard(board.id);
      setBoards((current) => current.filter((entry) => entry.id !== board.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("board.deleteFailed"));
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
          {t("admin.boards")}
        </Typography>
        <Button
          component={RouterLink}
          to="/admin/boards/new"
          variant="contained"
        >
          {t("board.create")}
        </Button>
      </Box>
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : boards.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            {t("board.noBoardsYet")}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("table.name")}</TableCell>
                <TableCell>{t("table.created")}</TableCell>
                <TableCell align="right">{t("table.users")}</TableCell>
                <TableCell align="right">{t("table.items")}</TableCell>
                <TableCell align="right">{t("table.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {boards.map((board) => (
                <TableRow key={board.id}>
                  <TableCell>
                    <Button
                      component={RouterLink}
                      to={`/admin/boards/${board.id}`}
                      sx={{ textTransform: "none", p: 0, minWidth: 0 }}
                    >
                      {board.name}
                    </Button>
                  </TableCell>
                  <TableCell>{formatDateTime(board.createdAt)}</TableCell>
                  <TableCell align="right">{board.allowedUserCount}</TableCell>
                  <TableCell align="right">{board.itemCount}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => navigate(`/admin/boards/${board.id}`)}
                    >
                      {t("table.edit")}
                    </Button>
                    <IconButton
                      aria-label={t("table.deleteBoardAria", {
                        name: board.name,
                      })}
                      color="error"
                      onClick={() => void handleDelete(board)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

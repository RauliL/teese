import DeleteIcon from "@mui/icons-material/Delete";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
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
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { PublicUser } from "../../../types.js";
import * as authApi from "../../api/auth.js";
import { ApiError } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.js";
import { useMessages } from "../../i18n/useMessages.js";

export function UsersPage() {
  const { t } = useMessages();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.listUsers();
      setUsers(response.users);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.loadUsersFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, [t]);

  async function handleDelete(user: PublicUser) {
    if (
      !window.confirm(t("admin.deleteUserConfirm", { username: user.username }))
    ) {
      return;
    }

    try {
      await authApi.deleteUser(user.username);
      setUsers((current) =>
        current.filter((entry) => entry.username !== user.username),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.deleteUserFailed"),
      );
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
          {t("admin.users")}
        </Typography>
        <Button
          component={RouterLink}
          to="/admin/users/new"
          variant="contained"
        >
          {t("admin.createUser")}
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
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("auth.username")}</TableCell>
                <TableCell>{t("table.role")}</TableCell>
                <TableCell align="right">{t("table.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.username}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        user.isAdmin
                          ? t("admin.roleAdministrator")
                          : t("admin.roleUser")
                      }
                      color={user.isAdmin ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {user.username !== currentUser?.username ? (
                      <IconButton
                        aria-label={t("table.deleteUserAria", {
                          username: user.username,
                        })}
                        color="error"
                        onClick={() => void handleDelete(user)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : null}
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

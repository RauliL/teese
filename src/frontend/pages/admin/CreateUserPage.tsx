import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import * as authApi from "../../api/auth.js";
import { ApiError } from "../../api/client.js";
import { useMessages } from "../../i18n/useMessages.js";

export function CreateUserPage() {
  const { t } = useMessages();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await authApi.createUser({ username, password, isAdmin });
      navigate("/admin/users");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.createUserFailed"),
      );
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
          {t("admin.createUser")}
        </Typography>
        <Button component={RouterLink} to="/admin/users" variant="outlined">
          {t("nav.backToUsers")}
        </Button>
      </Box>
      <Paper sx={{ p: 3, maxWidth: 480 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="new-username"
            label={t("auth.username")}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            margin="normal"
            required
            fullWidth
          />
          <TextField
            id="new-password"
            label={t("auth.password")}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            margin="normal"
            required
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                id="new-is-admin"
                checked={isAdmin}
                onChange={(event) => setIsAdmin(event.target.checked)}
              />
            }
            label={t("admin.administrator")}
            sx={{ mt: 1 }}
          />
          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{ mt: 3 }}
          >
            {submitting ? t("admin.creatingUser") : t("admin.createUser")}
          </Button>
        </Box>
      </Paper>
    </>
  );
}

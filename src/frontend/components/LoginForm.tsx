import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { FormEvent, FunctionComponent, useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { useMessages } from "../i18n/useMessages.js";

export const LoginForm: FunctionComponent = () => {
  const { login, error, clearError } = useAuth();
  const { t } = useMessages();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setSubmitting(true);

    try {
      await login({ username, password });
    } catch {
      // Error state is handled in AuthContext.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography component="h1" variant="h5" gutterBottom>
        {t("app.signIn")}
      </Typography>
      <TextField
        id="username"
        name="username"
        label={t("auth.username")}
        autoFocus
        autoComplete="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        margin="normal"
        required
        fullWidth
      />
      <TextField
        id="password"
        name="password"
        label={t("auth.password")}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        margin="normal"
        required
        fullWidth
      />
      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : null}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={submitting}
        sx={{ mt: 3 }}
      >
        {submitting ? t("app.signingIn") : t("app.signIn")}
      </Button>
    </Box>
  );
};

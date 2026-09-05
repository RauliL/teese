import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingScreen } from "../components/LoadingScreen.js";
import { LoginForm } from "../components/LoginForm.js";
import { useAuth } from "../context/AuthContext.js";

function getRedirectPath(from: string | undefined): string {
  if (from && from !== "/login") {
    return from;
  }

  return "/";
}

export function LoginPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from =
    typeof location.state?.from === "string" ? location.state.from : undefined;

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to={getRedirectPath(from)} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={2} sx={{ p: 4 }}>
          <LoginForm />
        </Paper>
      </Container>
    </Box>
  );
}

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

export function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
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
      <Container maxWidth="sm">
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Welcome, {user?.username}
          </Typography>
          {user?.isAdmin ? (
            <Typography paragraph>
              You have administrator access. Open the{" "}
              <Link component={RouterLink} to="/admin">
                admin dashboard
              </Link>
              .
            </Typography>
          ) : (
            <Typography paragraph color="text.secondary">
              You are signed in, but you do not have administrator access.
            </Typography>
          )}
          <Button variant="outlined" onClick={handleLogout}>
            Sign out
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

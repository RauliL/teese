import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import type { PublicUser } from "../../../types.js";
import * as authApi from "../../api/auth.js";
import * as boardsApi from "../../api/boards.js";
import { ApiError } from "../../api/client.js";

export function DashboardPage() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [boardCount, setBoardCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [usersResponse, boardsResponse] = await Promise.all([
          authApi.listUsers(),
          boardsApi.listBoards(),
        ]);

        if (!cancelled) {
          setUsers(usersResponse.users);
          setBoardCount(boardsResponse.boards.length);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Could not load dashboard.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const adminCount = users.filter((user) => user.isAdmin).length;

  const stats = [
    { label: "Total users", value: users.length },
    { label: "Administrators", value: adminCount },
    { label: "Boards", value: boardCount },
  ];

  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        Dashboard
      </Typography>
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
        <Grid container spacing={3}>
          {stats.map((stat) => (
            <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {stat.label}
                  </Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}

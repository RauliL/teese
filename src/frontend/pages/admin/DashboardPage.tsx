import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import React, { useEffect, useMemo, useState } from "react";
import type { PublicUser } from "../../../types.js";
import * as authApi from "../../api/auth.js";
import * as boardsApi from "../../api/boards.js";
import { ApiError } from "../../api/client.js";
import { useMessages } from "../../i18n/useMessages.js";
import type { MessageKey } from "../../i18n/messages.js";

export function DashboardPage() {
  const { t } = useMessages();
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
            err instanceof ApiError
              ? err.message
              : t("admin.loadDashboardFailed"),
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
  }, [t]);

  const adminCount = users.filter((user) => user.isAdmin).length;

  const stats = useMemo(
    (): { labelKey: MessageKey; value: number }[] => [
      { labelKey: "admin.totalUsers", value: users.length },
      { labelKey: "admin.administrators", value: adminCount },
      { labelKey: "admin.boards", value: boardCount },
    ],
    [users.length, adminCount, boardCount],
  );

  return (
    <>
      <Typography component="h1" variant="h4" gutterBottom>
        {t("admin.dashboard")}
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
            <Grid key={stat.labelKey} size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {t(stat.labelKey)}
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

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import React, { FunctionComponent } from "react";
import { useMessages } from "../i18n/useMessages.js";

type LoadingScreenProps = {
  message?: string;
};

export const LoadingScreen: FunctionComponent<LoadingScreenProps> = ({
  message,
}) => {
  const { t } = useMessages();

  return (
    <Box
      sx={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">
        {message ?? t("app.loading")}
      </Typography>
    </Box>
  );
};

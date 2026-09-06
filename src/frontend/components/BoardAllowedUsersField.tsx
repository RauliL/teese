import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { FunctionComponent, useEffect, useState } from "react";
import type { PublicUser } from "../../types.js";
import { OPEN_FOR_EVERYONE_USERNAME } from "../../types.js";
import * as authApi from "../api/auth.js";
import { ApiError } from "../api/client.js";
import { useMessages } from "../i18n/useMessages.js";

type AccessMode = "everyone" | "selected";

type BoardAllowedUsersFieldProps = {
  value: string[];
  onChange: (usernames: string[]) => void;
  disabled?: boolean;
};

function getAccessMode(value: string[]): AccessMode {
  return value.includes(OPEN_FOR_EVERYONE_USERNAME) ? "everyone" : "selected";
}

function getSelectedUsernames(value: string[]): string[] {
  return value.filter((username) => username !== OPEN_FOR_EVERYONE_USERNAME);
}

export const BoardAllowedUsersField: FunctionComponent<
  BoardAllowedUsersFieldProps
> = ({ value, onChange, disabled = false }) => {
  const { t } = useMessages();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const accessMode = getAccessMode(value);
  const selectedUsernames = getSelectedUsernames(value);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const response = await authApi.listUsers();
        if (!cancelled) {
          setUsers(response.users);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : t("board.loadUsersFailed"),
          );
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const options = users.map((user) => user.username);

  function handleAccessModeChange(
    _event: React.ChangeEvent<HTMLInputElement>,
    mode: string,
  ) {
    if (mode === "everyone") {
      onChange([OPEN_FOR_EVERYONE_USERNAME]);
      return;
    }

    onChange(selectedUsernames);
  }

  function handleSelectedUsersChange(selected: string[]) {
    onChange(selected);
  }

  return (
    <>
      <FormControl component="fieldset" disabled={disabled}>
        <FormLabel component="legend">{t("board.accessPolicy")}</FormLabel>
        <RadioGroup
          value={accessMode}
          onChange={handleAccessModeChange}
          sx={{ mt: 0.5 }}
        >
          <FormControlLabel
            value="everyone"
            control={<Radio />}
            label={t("board.accessEveryone")}
          />
          <FormControlLabel
            value="selected"
            control={<Radio />}
            label={t("board.accessSelectedUsers")}
          />
        </RadioGroup>
      </FormControl>
      {accessMode === "selected" ? (
        <Autocomplete
          multiple
          options={options}
          value={selectedUsernames}
          onChange={(_event, selected) => handleSelectedUsersChange(selected)}
          disabled={disabled || options.length === 0}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("board.allowedUsers")}
              helperText={t("board.allowedUsersHelp")}
            />
          )}
        />
      ) : (
        <Typography color="text.secondary" variant="body2">
          {t("board.accessEveryoneHelp")}
        </Typography>
      )}
      {error ? (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      ) : null}
    </>
  );
};

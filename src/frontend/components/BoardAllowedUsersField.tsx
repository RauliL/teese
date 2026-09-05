import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import type { PublicUser } from "../../../types.js";
import * as authApi from "../api/auth.js";
import { ApiError } from "../api/client.js";

type BoardAllowedUsersFieldProps = {
  value: string[];
  onChange: (usernames: string[]) => void;
  disabled?: boolean;
};

export function BoardAllowedUsersField({
  value,
  onChange,
  disabled = false,
}: BoardAllowedUsersFieldProps) {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);

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
            err instanceof ApiError ? err.message : "Could not load users.",
          );
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const options = users.map((user) => user.username);

  return (
    <>
      <Autocomplete
        multiple
        options={options}
        value={value}
        onChange={(_event, selected) => onChange(selected)}
        disabled={disabled || options.length === 0}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Allowed users"
            helperText="Only selected users can access this board in the kanban UI. Administrators always have access."
          />
        )}
      />
      {error ? (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      ) : null}
    </>
  );
}

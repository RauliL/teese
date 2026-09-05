import React, { FormEvent, useState } from "react";
import * as authApi from "../api/auth.js";
import { ApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.js";

export function AdminPanel() {
  const { user, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);

    try {
      const { user: createdUser } = await authApi.createUser({
        username,
        password,
        isAdmin,
      });
      setMessage(`Created user "${createdUser.username}".`);
      setUsername("");
      setPassword("");
      setIsAdmin(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p>
        Signed in as <strong>{user?.username}</strong>
        {user?.isAdmin ? " (administrator)" : ""}.
      </p>
      <button type="button" onClick={logout}>
        Sign out
      </button>

      {user?.isAdmin ? (
        <section>
          <h2>Create user</h2>
          <form onSubmit={handleCreateUser}>
            <p>
              <label htmlFor="new-username">Username</label>
              <br />
              <input
                id="new-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </p>
            <p>
              <label htmlFor="new-password">Password</label>
              <br />
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </p>
            <p>
              <label htmlFor="new-is-admin">
                <input
                  id="new-is-admin"
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(event) => setIsAdmin(event.target.checked)}
                />{" "}
                Administrator
              </label>
            </p>
            {message ? <p>{message}</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create user"}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}

import React, { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext.js";

export function LoginForm() {
  const { login, error, clearError } = useAuth();
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
    <form onSubmit={handleSubmit}>
      <h1>Sign in</h1>
      <p>
        <label htmlFor="username">Username</label>
        <br />
        <input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <br />
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </p>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

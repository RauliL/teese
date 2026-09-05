import React from "react";
import { AdminPanel } from "./components/AdminPanel.js";
import { LoginForm } from "./components/LoginForm.js";
import { useAuth } from "./context/AuthContext.js";

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return user ? <AdminPanel /> : <LoginForm />;
}

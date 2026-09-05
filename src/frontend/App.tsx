import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingScreen } from "./components/LoadingScreen.js";
import { useAuth } from "./context/AuthContext.js";
import { AdminLayout } from "./layouts/AdminLayout.js";
import { CreateUserPage } from "./pages/admin/CreateUserPage.js";
import { DashboardPage } from "./pages/admin/DashboardPage.js";
import { UsersPage } from "./pages/admin/UsersPage.js";
import { HomePage } from "./pages/HomePage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RequireAdmin } from "./routes/RequireAdmin.js";
import { RequireAuth } from "./routes/RequireAuth.js";

export function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/new" element={<CreateUserPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

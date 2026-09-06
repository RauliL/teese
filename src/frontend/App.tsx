import React, { FunctionComponent } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingScreen } from "./components/LoadingScreen.js";
import { useAuth } from "./context/AuthContext.js";
import { AdminLayout } from "./layouts/AdminLayout.js";
import { CreateBoardPage } from "./pages/admin/CreateBoardPage.js";
import { BoardDetailPage } from "./pages/admin/BoardDetailPage.js";
import { BoardsPage } from "./pages/admin/BoardsPage.js";
import { CreateUserPage } from "./pages/admin/CreateUserPage.js";
import { DashboardPage } from "./pages/admin/DashboardPage.js";
import { UsersPage } from "./pages/admin/UsersPage.js";
import { KanbanPage } from "./pages/KanbanPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { RequireAdmin } from "./routes/RequireAdmin.js";
import { RequireAuth } from "./routes/RequireAuth.js";

export const App: FunctionComponent = () => {
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
            <KanbanPage />
          </RequireAuth>
        }
      />
      <Route
        path="/boards/:boardId"
        element={
          <RequireAuth>
            <KanbanPage />
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
        <Route path="boards/new" element={<CreateBoardPage />} />
        <Route path="boards/:id" element={<BoardDetailPage />} />
        <Route path="boards" element={<BoardsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/new" element={<CreateUserPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

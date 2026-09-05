import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingScreen } from "../components/LoadingScreen.js";
import { useAuth } from "../context/AuthContext.js";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

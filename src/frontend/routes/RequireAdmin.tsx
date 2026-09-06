import React, { FunctionComponent, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

export const RequireAdmin: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

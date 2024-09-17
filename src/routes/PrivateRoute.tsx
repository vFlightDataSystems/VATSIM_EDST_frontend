import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { vatsimTokenSelector, sessionActiveSelector } from "~redux/slices/authSlice";
import { useRootSelector } from "~redux/hooks";

const PrivateRoute = () => {
  const token = useRootSelector(vatsimTokenSelector);
  const sessionActive = useRootSelector(sessionActiveSelector);

  //localStorage.removeItem("vatsim-token");

  // User needs a valid token and an active session before viewing EDST
  return (token) ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

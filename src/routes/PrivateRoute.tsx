import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { sessionSelector } from "../redux/slices/authSlice";
import { useRootSelector } from "../redux/hooks";

const PrivateRoute = () => {
  const session = useRootSelector(sessionSelector);

  // User needs a valid session and an ARTCC id before viewing EDST
  return session ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

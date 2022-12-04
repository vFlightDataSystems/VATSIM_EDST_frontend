import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { vatsimTokenSelector } from "~redux/slices/authSlice";
import { useRootSelector } from "~redux/hooks";

const PrivateRoute = () => {
  const token = useRootSelector(vatsimTokenSelector);

  // User needs a valid token before viewing EDST
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

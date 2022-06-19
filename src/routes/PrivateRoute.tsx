import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isLoggedInSelector } from "../redux/slices/authSlice";
import { useRootSelector } from "../redux/hooks";

const PrivateRoute = () => {
  const location = useLocation();
  const isLoggedIn = useRootSelector(isLoggedInSelector);

  return isLoggedIn ? <Outlet /> : <Navigate to={`/login?next=${location.pathname}`} replace />;
};

export default PrivateRoute;

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { isLoggedInSelector } from "../redux/slices/authSlice";

const PublicRoute = () => {
  const isLoggedIn = useSelector(isLoggedInSelector);

  return isLoggedIn ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;

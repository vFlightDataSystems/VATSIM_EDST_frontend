import { Navigate, Outlet } from "react-router-dom";
import { vatsimTokenSelector, sessionActiveSelector } from "~redux/slices/authSlice";
import { useRootSelector } from "~redux/hooks";

const PrivateRoute = () => {
  const token = useRootSelector(vatsimTokenSelector);

  // User needs a valid token and a connection before viewing EDST

  return (token) ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

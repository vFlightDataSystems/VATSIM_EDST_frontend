import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { useEffect } from "react";
import EdstProvider from "~/Edst";
import LoginProvider from "~/login/Login";
import PrivateRoute from "~/routes/PrivateRoute";
import { useRootDispatch } from "~redux/hooks";
import { getVnasConfig } from "~redux/slices/authSlice";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { HubContextProvider } from "./contexts/HubContext";

const App = () => {
  const dispatch = useRootDispatch();

  useEffect(() => {
    dispatch(getVnasConfig());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <HubContextProvider>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<LoginProvider />} />
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<EdstProvider />} />
          </Route>
        </Routes>
      </HubContextProvider>
    </BrowserRouter>
  );
};

export default App;

declare module "react" {
  export interface CSSProperties {
    "--brightness"?: number;
    "--background-color"?: React.CSSProperties["backgroundColor"];
    "--border-color"?: React.CSSProperties["borderColor"];
    "--width"?: React.CSSProperties["width"];
    "--height"?: React.CSSProperties["height"];
  }
}

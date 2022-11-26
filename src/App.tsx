import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";
import EdstProvider from "~/Edst";
import Login from "~/login/Login";
import PrivateRoute from "~/routes/PrivateRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<EdstProvider />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

declare module "react" {
  export interface CSSProperties {
    "--brightness"?: number;
    "--background-color"?: React.CSSProperties["backgroundColor"];
    "--width"?: React.CSSProperties["width"];
    "--height"?: React.CSSProperties["height"];
  }
}

import * as React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "~/index.css";
import "~/css/styles.css";
import store from "~/redux/store";
import App from "~/App";
// import reportWebVitals from './reportWebVitals';

declare global {
  interface Window {
    __TAURI__: Record<string, unknown>;
  }
}

const container = document.getElementById("root");
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

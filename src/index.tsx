import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "~/index.css";
import "css/global.scss";
import store from "~/redux/store";
import App from "~/App";

declare global {
  interface Window {
    __TAURI__: Record<string, unknown>;
  }
}

const edstFont = new FontFace("EDST", "url(fonts/EDSTv300.ttf)");
const eramFont = new FontFace("ERAM", "url(fonts/ERAMv300.ttf)");

document.fonts.add(edstFont);
document.fonts.add(eramFont);

void edstFont.load();
void eramFont.load();

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

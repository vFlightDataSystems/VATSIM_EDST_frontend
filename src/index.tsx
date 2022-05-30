import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./index.css";
import "./css/styles.scss";
import { App } from "./App";
import store from "./redux/store";
import { HubProvider } from "./hub";
// import reportWebVitals from './reportWebVitals';

declare global {
  interface Window {
    __TAURI__: Record<string, unknown>;
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <HubProvider>
        <App />
      </HubProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

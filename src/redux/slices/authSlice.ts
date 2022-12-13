import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Nullable } from "types/utility-types";
import type { RootState } from "~redux/store";
import type { ApiSessionInfoDto } from "types/apiTypes/apiSessionInfoDto";
import { login as apiLogin } from "api/vNasDataApi";

type Environment = { name: string; apiBaseUrl: string; clientHubUrl: string; isSweatbox: boolean };
type Config = {
  artccBoundariesUrl: string;
  artccAoisUrl: string;
  environments: Environment[];
};

export const getVnasConfig = createAsyncThunk<Config>("auth/getVnasConfig", async () => {
  const response = await fetch(import.meta.env.VITE_VNAS_CONFIG_URL);
  if (!response.ok) {
    throw new Error("Failed to load config");
  }
  return response.json();
});

type AuthState = {
  vatsimToken: Nullable<string>;
  session: Nullable<ApiSessionInfoDto>;
  isRefreshingSession: boolean;
  vnasConfig: Nullable<Config>;
  environment: Nullable<Environment>;
};

const initialState: AuthState = {
  vatsimToken: null,
  session: null,
  isRefreshingSession: false,
  vnasConfig: null,
  environment: null,
};

type CodeExchangeProps = {
  code: string;
  redirectUrl: string;
};

export const login = createAsyncThunk<Awaited<ReturnType<typeof apiLogin>>, CodeExchangeProps, { state: RootState }>(
  "auth/login",
  async (data, thunkAPI) => {
    const environment = thunkAPI.getState().auth.environment;
    if (!environment) {
      throw new Error("Environment not set");
    }
    return apiLogin(environment.apiBaseUrl, data.code, data.redirectUrl);
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(getVnasConfig.fulfilled, (state, action) => {
      const config = action.payload;
      state.vnasConfig = action.payload;
      const localEnvironment = localStorage.getItem("vedst-environment");
      if (localEnvironment !== null) {
        const availableEnvironment = config.environments.find((e) => e.name === localEnvironment);
        if (availableEnvironment) {
          state.environment = availableEnvironment;
        } else {
          localStorage.removeItem("vedst-environment");
          state.environment = config.environments[0];
        }
      } else {
        state.environment = config.environments[0];
      }
    });
    builder.addCase(login.fulfilled, (state, action) => {
      if (action.payload.ok) {
        state.vatsimToken = action.payload.vatsimToken;
      } else {
        // TODO: inform user that login failed
        console.log(`Failed to log in: ${action.payload.statusText}`);
      }
    });
  },
  reducers: {
    setSession(state, action: PayloadAction<ApiSessionInfoDto>) {
      state.session = action.payload;
    },
    clearSession(state) {
      state.session = null;
    },
    setEnv(state, action: PayloadAction<string>) {
      if (state.vnasConfig) {
        state.environment = state.vnasConfig.environments.find((e) => e.name === action.payload) ?? null;
        localStorage.setItem("vedst-environment", action.payload);
      }
    },
  },
});

export const { setSession, clearSession, setEnv } = authSlice.actions;
export default authSlice.reducer;

export const vatsimTokenSelector = (state: RootState) => state.auth.vatsimToken;
export const configSelector = (state: RootState) => state.auth.vnasConfig;
export const envSelector = (state: RootState) => state.auth.environment;

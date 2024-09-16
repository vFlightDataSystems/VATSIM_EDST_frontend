import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Nullable } from "types/utility-types";
import type { ApiSessionInfoDto } from "types/apiTypes/apiSessionInfoDto";
import { login as apiLogin } from "api/vNasDataApi";
import type { RootState } from "~redux/store";
import * as jose from "jose";

///

function tokenHasExpired(token: JWTPayload) {
  return token.exp! - Math.trunc(Date.now() / 1000) < 0;
};

function getLocalVatsimToken() {
  const vatsimToken = localStorage.getItem("vatsim-token");
  if (!vatsimToken) {
    return null;
  }

  const decodedToken = jose.decodeJwt(vatsimToken);
  if (!tokenHasExpired(decodedToken)) {
    return vatsimToken;
  }

  return null;
}

///

type Environment = { name: string; apiBaseUrl: string; clientHubUrl: string; isSweatbox: boolean; isPrimary?: boolean; isDisabled?: boolean };

type AuthState = {
    vnasConfiguration: Nullable<Config>;
    vatsimCode: Nullable<string>;
    vatsimToken: Nullable<string>;
    environment: Nullable<Environment>;
    session: Nullable<ApiSessionInfoDto>;
}

type Config = {
    artccBoundariesUrl: string;
    artccAoisUrl: string;
    environments: Environment[];
};

type CodeExchangeProps = {
    code: string;
    redirectUrl: string;
};

const initialState: AuthState = {
    vnasConfiguration: null,
    vatsimCode: null,
    vatsimToken: getLocalVatsimToken(),
    environment: null,
    session: null
}

export const getVnasConfig = createAsyncThunk<Config>("auth/getVnasConfig", async () => {
    const response = await fetch(import.meta.env.VITE_VNAS_CONFIG_URL);
    if (!response.ok) {
      throw new Error("Failed to load config");
    }
    return response.json();
});

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
            state.vnasConfiguration = action.payload;
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
              const newToken = action.payload.vatsimToken;
              state.vatsimToken = newToken;
              localStorage.setItem('vatsim-token', newToken);
            } else {
              // TODO: inform user that login failed via a GUI perhaps??
              console.log(`Failed to log in: ${action.payload.statusText}`);
            }
        });
        builder.addCase(login.rejected, (state, action) => {
          state.vatsimToken = null;
          state.vatsimCode = null;
          localStorage.removeItem("vatsim-token");
          console.log(`Failed to log in: ${action.error.message}`);
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
            if (state.vnasConfiguration) {
              state.environment = state.vnasConfiguration.environments.find((e) => e.name === action.payload) ?? null;
              localStorage.setItem("vedst-environment", action.payload);
            }
        },
    }
})

export const { setSession, clearSession, setEnv } = authSlice.actions;
export default authSlice.reducer;

export const vatsimTokenSelector = (state: RootState) => state.auth.vatsimToken;
export const configSelector = (state: RootState) => state.auth.vnasConfiguration;
export const envSelector = (state: RootState) => state.auth.environment;
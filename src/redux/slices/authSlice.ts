import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as jose from "jose";
import { login as apiLogin, logout as apiLogout } from "../../api/vNasDataApi";
import { RootState } from "../store";

type LoginProps = {
  code: string;
  redirectUrl: string;
};

export const login = createAsyncThunk("auth/login", async (data: LoginProps) => {
  return apiLogin(data.code, data.redirectUrl);
});

export const logout = createAsyncThunk("auth/logout", async () => {
  return apiLogout();
});

interface JwtToken extends jose.JWTPayload {
  controller_rating: number;
  exp: number;
  iat: number;
  iss: string;
  nbf: number;
}

export interface AuthState {
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  token: JwtToken | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  isLoggingIn: false,
  token: null
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  extraReducers: builder => {
    builder.addCase(login.pending, state => {
      state.isLoggingIn = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoggingIn = false;
      if (action.payload.ok) {
        state.isLoggedIn = true;
        state.token = jose.decodeJwt(action.payload.token) as JwtToken;
      } else {
        // TODO: inform user that login failed
        console.log(`Failed to log in: ${action.payload.statusText}`);
      }
    });
    builder.addCase(logout.fulfilled, (state, action) => {
      if (action.payload.ok) {
        state.isLoggedIn = false;
        state.token = null;
        console.log("Successfully logged out");
      }
    });
  },
  reducers: {}
});

export default authSlice.reducer;

export const isLoggedInSelector = (state: RootState) => state.auth.isLoggedIn;

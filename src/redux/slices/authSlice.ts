import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as jose from "jose";
import { exchangeCode as apiExchangeCode, getSession as apiGetSession } from "../../api/vNasDataApi";
import { RootState } from "../store";
import { SessionInfo } from "../../types";
import { setArtccId } from "./sectorSlice";

type CodeExchangeProps = {
  code: string;
  redirectUrl: string;
};

export const exchangeCode = createAsyncThunk("auth/login", async (data: CodeExchangeProps, thunkAPI) => {
  return apiExchangeCode(data.code, data.redirectUrl).then(response => {
    if (response.ok) {
      thunkAPI.dispatch(getSession(jose.decodeJwt(response.token).sub!));
    }
    return response;
  });
});

export const getSession = createAsyncThunk("auth/getSession", async (userId: string, thunkAPI) => {
  return apiGetSession(userId).then(response => {
    if (response.ok && response.data?.artccId) {
      thunkAPI.dispatch(setArtccId(response.data.artccId));
    }
    return response;
  });
});

interface JwtToken extends jose.JWTPayload {
  controller_rating: number;
  exp: number;
  iat: number;
  iss: string;
  nbf: number;
}

export type AuthState = {
  isExchangingCode: boolean;
  token: JwtToken | null;
  session: SessionInfo | null;
  isRefreshingSession: boolean;
};

const initialState: AuthState = {
  isExchangingCode: false,
  token: null,
  session: null,
  isRefreshingSession: false
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  extraReducers: builder => {
    builder.addCase(exchangeCode.pending, state => {
      state.isExchangingCode = true;
    });
    builder.addCase(exchangeCode.fulfilled, (state, action) => {
      state.isExchangingCode = false;
      if (action.payload.ok) {
        state.token = jose.decodeJwt(action.payload.token) as JwtToken;
      } else {
        // TODO: inform user that login failed
        console.log(`Failed to log in: ${action.payload.statusText}`);
      }
    });
    builder.addCase(getSession.pending, state => {
      state.isRefreshingSession = true;
    });
    builder.addCase(getSession.fulfilled, (state, action) => {
      state.isRefreshingSession = false;
      if (action.payload.ok) {
        state.session = action.payload.data;
      } else {
        console.log(`Failed to get session: ${action.payload.statusText}`);
      }
    });
  },
  reducers: {}
});

export default authSlice.reducer;

export const isExchangingCodeSelector = (state: RootState) => state.auth.isExchangingCode;
export const sessionSelector = (state: RootState) => state.auth.session;
export const isRefreshingSessionSelector = (state: RootState) => state.auth.isRefreshingSession;

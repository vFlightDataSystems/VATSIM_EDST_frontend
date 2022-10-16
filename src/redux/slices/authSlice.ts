import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login as apiLogin } from "../../api/vNasDataApi";
import { RootState } from "../store";
import { ApiSessionInfoDto } from "../../typeDefinitions/types/apiTypes/apiSessionInfoDto";
import { Nullable } from "../../typeDefinitions/utility-types";

type AuthState = {
  vatsimToken: Nullable<string>;
  session: Nullable<ApiSessionInfoDto>;
  isRefreshingSession: boolean;
};

const initialState: AuthState = {
  vatsimToken: null,
  session: null,
  isRefreshingSession: false
};

type CodeExchangeProps = {
  code: string;
  redirectUrl: string;
};

export const login = createAsyncThunk("auth/login", async (data: CodeExchangeProps) => {
  return apiLogin(data.code, data.redirectUrl);
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  extraReducers: builder => {
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
    }
  }
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;

export const vatsimTokenSelector = (state: RootState) => state.auth.vatsimToken;

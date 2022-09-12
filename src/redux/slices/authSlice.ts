import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { login as apiLogin } from "../../api/vNasDataApi";
import { RootState } from "../store";
import { ApiSessionInfoDto } from "../../typeDefinitions/types/apiTypes/apiSessionInfoDto";

type AuthState = {
  vatsimToken: string | null;
  nasToken: string | null;
  session: ApiSessionInfoDto | null;
  isRefreshingSession: boolean;
};

const initialState: AuthState = {
  vatsimToken: null,
  nasToken: null,
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
        state.nasToken = action.payload.nasToken;
      } else {
        // TODO: inform user that login failed
        // eslint-disable-next-line no-console
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
export const nasTokenSelector = (state: RootState) => state.auth.nasToken;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import jscookie from "js-cookie";

interface InitialStateTypes {
  accessToken?: string | Record<string, unknown> | null;
  name?: string | null;
  role?: string | null;
}

interface LoginResponse {
  access_token?: string | Record<string, unknown> | null;
  name?: string | null;
  role?: string | null;
}

const initialState: InitialStateTypes = {
  accessToken: null,
  name: null,
  role: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, data: PayloadAction<LoginResponse>) => {
      const payload = data.payload;
      state.accessToken = payload.access_token;
      state.name = payload.name;
      state.role = payload.role;
      if (payload.access_token) {
        jscookie.set("token", payload.access_token);
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.name = null;
      state.role = null;
      jscookie.remove("token");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

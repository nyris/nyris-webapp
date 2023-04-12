import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import jscookie from 'js-cookie';
import { InitialStateTypes, LoginResponse } from './types';

const initialState: InitialStateTypes = {
  accessToken: null,
  name: null,
  role: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, data: PayloadAction<LoginResponse>) => {
      // state.accessToken = payload.access_token;
      // state.name = payload.name;
      // state.role = payload.role;
      // if (payload.access_token) {
      //   jscookie.set("token", payload?.access_token);
      // }
    },
    logout: state => {
      state.accessToken = null;
      state.name = null;
      state.role = null;
      jscookie.remove('token');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

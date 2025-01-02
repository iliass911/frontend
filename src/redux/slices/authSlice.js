// src/redux/slices/authSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {
    username: '',
    // ... other user properties
  },
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearUser(state) {
      state.user = { username: '' };
      state.token = null;
    },
    // ... other reducers like login, logout
  },
});

export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;

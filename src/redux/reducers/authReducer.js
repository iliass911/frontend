// src/redux/reducers/authReducer.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Login action
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, thunkAPI) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      console.log('Login API Response:', response.data); // Debugging

      if (response.data.token && response.data.role && response.data.userId) {
        // Convert role to uppercase
        const role = response.data.role.toUpperCase();

        // Store token, role, and userId in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', role);
        localStorage.setItem('userId', response.data.userId); // Store userId
        return { role, token: response.data.token, userId: response.data.userId };
      } else {
        return thunkAPI.rejectWithValue('Invalid response from server.');
      }
    } catch (error) {
      console.error('Login Error:', error.response?.data?.message || error.message); // Debugging
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Register action
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ username, password, matricule }, thunkAPI) => {
    try {
      const response = await api.post('/auth/register', { username, password, matricule });
      console.log('Register API Response:', response.data); // Debugging
      // Assuming registration returns the userId
      return { message: 'Registration successful', userId: response.data.userId };
    } catch (error) {
      console.error('Register Error:', error.response?.data?.message || error.message); // Debugging
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Initial State
const initialState = {
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') ? localStorage.getItem('role').toUpperCase() : null, // Ensure uppercase
  userId: localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId'), 10) : null, // Initialize userId
  loading: false,
  error: null,
  message: null
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Logout action
    logout(state) {
      state.token = null;
      state.role = null;
      state.userId = null; // Clear userId
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId'); // Remove userId from storage
    }
  },
  extraReducers: (builder) => {
    builder
      // Login Cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('Login Fulfilled:', action.payload); // Debugging
        state.loading = false;
        state.role = action.payload.role; // Already uppercase
        state.token = action.payload.token;
        state.userId = action.payload.userId;
      })
      .addCase(login.rejected, (state, action) => {
        console.log('Login Rejected:', action.payload); // Debugging
        state.loading = false;
        state.error = action.payload;
        state.token = null;
        state.role = null;
        state.userId = null; // Clear userId on failure
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId'); // Remove userId from storage
      })
      
      // Register Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log('Register Fulfilled:', action.payload); // Debugging
        state.loading = false;
        state.message = action.payload.message;
        state.userId = action.payload.userId; // Store userId if needed
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.log('Register Rejected:', action.payload); // Debugging
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Exports
export const { logout } = authSlice.actions;
export default authSlice.reducer;

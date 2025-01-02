// src/redux/reducers/boardInventoryReducer.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Async thunk to fetch board inventory
export const fetchBoardInventory = createAsyncThunk(
  'boardInventory/fetchBoardInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/boards'); // Ensure this endpoint exists and is correct
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue('Access denied: Admin privileges required');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch board inventory');
    }
  }
);

// Async thunk to add a new board
export const addBoard = createAsyncThunk(
  'boardInventory/addBoard',
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await api.post('/boards', boardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add board');
    }
  }
);

// Async thunk to update a board
export const updateBoard = createAsyncThunk(
  'boardInventory/updateBoard',
  async ({ id, boardData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/boards/${id}`, boardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update board');
    }
  }
);

// Async thunk to delete a board
export const deleteBoard = createAsyncThunk(
  'boardInventory/deleteBoard',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/boards/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete board');
    }
  }
);

const boardInventorySlice = createSlice({
  name: 'boardInventory',
  initialState: {
    boards: [],
    loading: false,
    error: null,
  },
  reducers: {
    // You can add synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      // Fetch Board Inventory
      .addCase(fetchBoardInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoardInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Board
      .addCase(addBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
      })
      .addCase(addBoard.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Update Board
      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.boards.findIndex((board) => board.id === action.payload.id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete Board
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter((board) => board.id !== action.payload);
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default boardInventorySlice.reducer;

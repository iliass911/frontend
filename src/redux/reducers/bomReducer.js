// src/redux/reducers/bomReducer.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Async Thunks

// Fetch all BOMs (Assuming your backend has an endpoint for this)
export const fetchAllBoms = createAsyncThunk(
  'bom/fetchAllBoms',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/boms'); // Adjust the endpoint if different
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch BOMs');
    }
  }
);

// Fetch BOM by ID
export const fetchBom = createAsyncThunk(
  'bom/fetchBom',
  async (bomId, thunkAPI) => {
    try {
      const response = await api.get(`/boms/${bomId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch BOM');
    }
  }
);

// Create BOM for a Board
export const createBom = createAsyncThunk(
  'bom/createBom',
  async (boardId, thunkAPI) => {
    try {
      const response = await api.post(`/boms/board/${boardId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create BOM');
    }
  }
);

// Add or Update BOM Lines
export const addOrUpdateBomLines = createAsyncThunk(
  'bom/addOrUpdateBomLines',
  async ({ bomId, bomLines }, thunkAPI) => {
    try {
      const response = await api.post(`/boms/${bomId}/lines`, bomLines);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update BOM Lines');
    }
  }
);

// Delete BOM
export const deleteBom = createAsyncThunk(
  'bom/deleteBom',
  async (bomId, thunkAPI) => {
    try {
      await api.delete(`/boms/${bomId}`);
      return bomId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete BOM');
    }
  }
);

// Initial State
const initialState = {
  boms: [], // List of BOMs
  bom: null, // Single BOM details
  loading: false,
  error: null,
  success: null,
};

// Slice
const bomSlice = createSlice({
  name: 'bom',
  initialState,
  reducers: {
    clearBomState: (state) => {
      state.boms = [];
      state.bom = null;
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All BOMs
      .addCase(fetchAllBoms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBoms.fulfilled, (state, action) => {
        state.loading = false;
        state.boms = action.payload;
      })
      .addCase(fetchAllBoms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch BOM by ID
      .addCase(fetchBom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBom.fulfilled, (state, action) => {
        state.loading = false;
        state.bom = action.payload;
      })
      .addCase(fetchBom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create BOM
      .addCase(createBom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBom.fulfilled, (state, action) => {
        state.loading = false;
        state.boms.push(action.payload);
        state.success = 'BOM created successfully';
      })
      .addCase(createBom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add or Update BOM Lines
      .addCase(addOrUpdateBomLines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrUpdateBomLines.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific BOM in the list
        const index = state.boms.findIndex((bom) => bom.id === action.payload.id);
        if (index !== -1) {
          state.boms[index] = action.payload;
        }
        // If the current BOM is being viewed, update it as well
        if (state.bom && state.bom.id === action.payload.id) {
          state.bom = action.payload;
        }
        state.success = 'BOM Lines updated successfully';
      })
      .addCase(addOrUpdateBomLines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete BOM
      .addCase(deleteBom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBom.fulfilled, (state, action) => {
        state.loading = false;
        state.boms = state.boms.filter((bom) => bom.id !== action.payload);
        state.success = 'BOM deleted successfully';
      })
      .addCase(deleteBom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBomState } = bomSlice.actions;
export default bomSlice.reducer;

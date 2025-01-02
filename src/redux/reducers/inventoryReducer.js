// src/redux/reducers/inventoryReducer.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Fetch inventory
export const fetchInventory = createAsyncThunk('inventory/fetchInventory', async () => {
  const response = await api.get('/inventory');
  return response.data;
});

// Add inventory
export const addInventory = createAsyncThunk('inventory/addInventory', async (item) => {
  const response = await api.post('/inventory', item);
  return response.data;
});

// Update inventory
export const updateInventory = createAsyncThunk('inventory/updateInventory', async ({ id, item }) => {
  const response = await api.put(`/inventory/${id}`, item);
  return response.data;
});

// Delete inventory
export const deleteInventory = createAsyncThunk('inventory/deleteInventory', async (id) => {
  await api.delete(`/inventory/${id}`);
  return id;
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addInventory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default inventorySlice.reducer;

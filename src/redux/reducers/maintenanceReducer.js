// src/redux/reducers/maintenanceReducer.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Fetch maintenance
export const fetchMaintenance = createAsyncThunk('maintenance/fetchMaintenance', async () => {
  const response = await api.get('/maintenance');
  return response.data;
});

// Add maintenance
export const addMaintenance = createAsyncThunk('maintenance/addMaintenance', async (intervention) => {
  const response = await api.post('/maintenance', intervention);
  return response.data;
});

// Update maintenance
export const updateMaintenance = createAsyncThunk('maintenance/updateMaintenance', async ({ id, intervention }) => {
  const response = await api.put(`/maintenance/${id}`, intervention);
  return response.data;
});

// Delete maintenance
export const deleteMaintenance = createAsyncThunk('maintenance/deleteMaintenance', async (id) => {
  await api.delete(`/maintenance/${id}`);
  return id;
});

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState: {
    interventions: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenance.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMaintenance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.interventions = action.payload;
      })
      .addCase(fetchMaintenance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addMaintenance.fulfilled, (state, action) => {
        state.interventions.push(action.payload);
      })
      .addCase(updateMaintenance.fulfilled, (state, action) => {
        const index = state.interventions.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.interventions[index] = action.payload;
        }
      })
      .addCase(deleteMaintenance.fulfilled, (state, action) => {
        state.interventions = state.interventions.filter((item) => item.id !== action.payload);
      });
  },
});

export default maintenanceSlice.reducer;

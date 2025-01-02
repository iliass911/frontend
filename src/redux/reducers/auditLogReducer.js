import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Async thunk to fetch audit logs
export const fetchAuditLogs = createAsyncThunk(
    'auditLog/fetchAuditLogs',
    async ({ page = 0, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/audit`, {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                return rejectWithValue('Access denied: Admin privileges required');
            }
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit logs');
        }
    }
);

const auditLogSlice = createSlice({
    name: 'auditLog',
    initialState: {
        logs: [],
        totalPages: 0,
        totalElements: 0,
        loading: false,
        error: null
    },
    reducers: {
        clearAuditLogs: (state) => {
            state.logs = [];
            state.totalPages = 0;
            state.totalElements = 0;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAuditLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAuditLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = action.payload.content;
                state.totalPages = action.payload.totalPages;
                state.totalElements = action.payload.totalElements;
            })
            .addCase(fetchAuditLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearAuditLogs } = auditLogSlice.actions;
export default auditLogSlice.reducer;

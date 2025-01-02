// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import inventoryReducer from './reducers/inventoryReducer';
import maintenanceReducer from './reducers/maintenanceReducer';
import auditLogReducer from './reducers/auditLogReducer';
import boardInventoryReducer from './reducers/boardInventoryReducer'; // Import the new reducer
import bomReducer from './reducers/bomReducer'; // Import BOM Reducer

const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer,
    maintenance: maintenanceReducer,
    auditLog: auditLogReducer,
    boardInventory: boardInventoryReducer, // Add to the store
  },
});

export default store;

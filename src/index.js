// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider as ReduxProvider } from 'react-redux';
import store from './redux/store';
import { ThemeProvider } from '@mui/material/styles';
import theme from './utils/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <AuthProvider> {/* Wrap AuthProvider here */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeProvider theme={theme}>
              <App />
            </ThemeProvider>
          </LocalizationProvider>
        </AuthProvider>
      </ReduxProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

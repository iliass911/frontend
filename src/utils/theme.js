// src/utils/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#424242', // Dark Gray
    },
    background: {
      default: '#f5f5f5', // Light Gray
      paper: '#ffffff', // White
    },
    text: {
      primary: '#000000', // Black
      secondary: '#424242', // Dark Gray
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: '#1976d2', // Blue
    },
    button: {
      textTransform: 'none', // Remove uppercase
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    // Add more component overrides as needed
  },
});

export default theme;

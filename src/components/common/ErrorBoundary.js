// src/components/common/ErrorBoundary.js

import React from 'react';
import { Box, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Typography variant="h4" color="error">
            Something went wrong.
          </Typography>
          <Typography variant="body1">
            Please try refreshing the page or contact support.
          </Typography>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

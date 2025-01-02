// src/components/ChartCard/ChartCard.js

import React from 'react';
import { Paper, Typography } from '@mui/material';
import { ResponsiveContainer } from 'recharts';

const ChartCard = ({ title, children }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </Paper>
  );
};

export default ChartCard;

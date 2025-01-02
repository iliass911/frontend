// src/components/SummaryCard/SummaryCard.js

import React from 'react';
import { Card, CardHeader, CardContent, Typography, Divider } from '@mui/material';

const SummaryCard = ({ title, value, color }) => {
  return (
    <Card>
      <CardHeader title={title} />
      <Divider />
      <CardContent>
        <Typography variant="h5" color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;

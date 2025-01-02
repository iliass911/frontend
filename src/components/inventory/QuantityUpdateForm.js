// src/components/inventory/QuantityUpdateForm.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import api from '../../api/api';

const QuantityUpdateForm = () => {
  const [quantity, setQuantity] = useState('');
  const [item, setItem] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch existing item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/inventory/${id}`);
        setItem(response.data);
        setQuantity(response.data.quantity);
      } catch (error) {
        alert('Failed to fetch inventory item for quantity update');
        console.error('Error fetching item:', error);
      }
    };
    fetchItem();
  }, [id]);

  // Handle form submission (quantity-only update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...item, quantity: Number(quantity) };
      // The backend will decide whether to run updateQuantityOnly() based on the user's role
      await api.put(`/inventory/${id}`, payload);
      alert('Quantity updated successfully');
      navigate('/inventory');
    } catch (error) {
      alert('Failed to update quantity');
      console.error('Error updating quantity:', error);
    }
  };

  if (!item) {
    return <Typography sx={{ p: 3 }}>Loading item data...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Update Quantity - {item.refCode}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" type="submit">
              Update Quantity
            </Button>
            <Button variant="outlined" onClick={() => navigate('/inventory')}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuantityUpdateForm;

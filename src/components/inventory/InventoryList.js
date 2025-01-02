// src/components/inventory/InventoryList.js

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux'; // <-- IMPORTANT: Using Redux to get user role
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Search, AddCircleOutline } from '@mui/icons-material';
import api from '../../api/api';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get user role from Redux (no more API call for /auth/me)
  const userRole = useSelector((state) => state.auth.role);
  // Adjust if your role is stored as "ROLE_ADMIN" vs. "ADMIN"
  const isAdmin = userRole === 'ADMIN';

  const navigate = useNavigate();

  // Debounced search function
  const searchInventory = useCallback(
    async (term) => {
      if (!term || term.length < 2) {
        setInventory([]);
        return;
      }
      setLoading(true);
      try {
        // Adjust the endpoint or params as needed for your search
        const response = await api.get('/inventory', {
          params: { refCode: term, site: term, type: term },
        });
        // Filter results across multiple fields
        const filteredResults = response.data.filter((item) =>
          item.refCode?.toLowerCase().includes(term.toLowerCase()) ||
          item.site?.toLowerCase().includes(term.toLowerCase()) ||
          item.type?.toLowerCase().includes(term.toLowerCase()) ||
          item.place?.toLowerCase().includes(term.toLowerCase())
        );
        setInventory(filteredResults);
      } catch (error) {
        console.error('Error searching inventory:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounce the search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchInventory(searchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchInventory]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        setInventory((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete the item.');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
        Inventory Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by ref code, site, type, or place..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        {/* Admin-only: "Add New Item" button */}
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={() => navigate('/inventory/add')}
          >
            Add New Item
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1976d2' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ref Code</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Site</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Place</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Unit</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price (€)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Price (€)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : !searchTerm ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Type at least 2 characters to search
                </TableCell>
              </TableRow>
            ) : inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No matching items found
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.refCode}</TableCell>
                  <TableCell>{item.site}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.place}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{(item.price * item.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/inventory/edit/${item.id}`)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Delete />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/inventory/update-quantity/${item.id}`)}
                      >
                        <Edit />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryList;

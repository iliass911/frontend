// src/pages/PreventiveMaintenance/admin/PacksManagement.js

import React, { useEffect, useState } from 'react';
import api from '../../../api/api';
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Modal,
  TextField,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tooltip,
  Snackbar,     // Import Snackbar
  Alert         // Import Alert
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import ReusableModal from '../../../components/common/ReusableModal';

const PacksManagement = () => {
  const [packs, setPacks] = useState([]);
  const [sites, setSites] = useState([]); // Changed from projects to sites
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', siteId: '' }); // Changed projectId to siteId
  const [editingPack, setEditingPack] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSites();
    fetchPacks();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSnackbar({ open: true, message: 'Failed to fetch sites.', severity: 'error' });
    }
  };

  const fetchPacks = async () => {
    try {
      const response = await api.get('/packs');
      setPacks(response.data);
    } catch (error) {
      console.error('Error fetching packs:', error);
      setSnackbar({ open: true, message: 'Failed to fetch packs.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pack = null) => {
    if (pack) {
      setEditingPack(pack);
      setFormData({ name: pack.name, siteId: pack.siteId }); // Changed projectId to siteId
    } else {
      setEditingPack(null);
      setFormData({ name: '', siteId: '' }); // Changed projectId to siteId
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingPack(null);
    setFormData({ name: '', siteId: '' }); // Changed projectId to siteId
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingPack) {
        await api.put(`/packs/${editingPack.id}`, formData); // Ensure backend can handle siteId
        setSnackbar({ open: true, message: 'Pack updated successfully!', severity: 'success' });
      } else {
        await api.post('/packs', formData); // Ensure backend can handle siteId
        setSnackbar({ open: true, message: 'Pack created successfully!', severity: 'success' });
      }
      fetchPacks();
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting pack:', error);
      setSnackbar({ open: true, message: 'Failed to submit pack.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pack?')) {
      try {
        await api.delete(`/packs/${id}`);
        setPacks(packs.filter((pack) => pack.id !== id));
        setSnackbar({ open: true, message: 'Pack deleted successfully!', severity: 'success' });
      } catch (error) {
        console.error('Error deleting pack:', error);
        setSnackbar({ open: true, message: 'Failed to delete pack.', severity: 'error' });
      }
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const formFields = [
    {
      label: 'Pack Name',
      name: 'name',
      type: 'text',
      value: formData.name,
      required: true,
      error: !formData.name,
      helperText: !formData.name ? 'Pack name is required' : '',
    },
    {
      label: 'Select Site', // Changed from Project to Site
      name: 'siteId',
      type: 'select',
      value: formData.siteId,
      required: true,
      options: sites.map((site) => ({ value: site.id, display: site.name })),
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Packs
      </Typography>
      <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
        Add Pack
      </Button>
      {packs.length === 0 ? (
        <Typography>No packs found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Site</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {packs.map((pack) => (
              <TableRow key={pack.id}>
                <TableCell>{pack.name}</TableCell>
                <TableCell>
                  {sites.find((site) => site.id === pack.siteId)?.name || 'N/A'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Pack">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenModal(pack)}
                      aria-label="edit pack"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Pack">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(pack.id)}
                      aria-label="delete pack"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Reusable Modal for Add/Edit Pack */}
      <ReusableModal
        open={openModal}
        handleClose={handleCloseModal}
        title={editingPack ? 'Edit Pack' : 'Add Pack'}
        formFields={formFields}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        submitLabel={editingPack ? 'Update' : 'Create'}
        submitting={submitting}
      />

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PacksManagement;

// Styles for the Modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

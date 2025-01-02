// src/pages/PreventiveMaintenance/admin/SitesManagement.js

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
  Tooltip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const SitesManagement = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [editingSite, setEditingSite] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
      alert('Failed to fetch sites.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (site = null) => {
    if (site) {
      setEditingSite(site);
      setFormData({ name: site.name, location: site.location });
    } else {
      setEditingSite(null);
      setFormData({ name: '', location: '' });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingSite(null);
    setFormData({ name: '', location: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingSite) {
        await api.put(`/sites/${editingSite.id}`, formData);
        alert('Site updated successfully.');
      } else {
        await api.post('/sites', formData);
        alert('Site added successfully.');
      }
      fetchSites();
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting site:', error);
      alert('Failed to submit site.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
        await api.delete(`/sites/${id}`);
        setSites(sites.filter((site) => site.id !== id));
        alert('Site deleted successfully.');
      } catch (error) {
        console.error('Error deleting site:', error);
        alert('Failed to delete site.');
      }
    }
  };

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
        Sites
      </Typography>
      <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
        Add Site
      </Button>
      {sites.length === 0 ? (
        <Typography>No sites found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.id}>
                <TableCell>{site.name}</TableCell>
                <TableCell>{site.location}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Site">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenModal(site)}
                      aria-label="edit site"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Site">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(site.id)}
                      aria-label="delete site"
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

      {/* Modal for Add/Edit Site */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            {editingSite ? 'Edit Site' : 'Add Site'}
          </Typography>
          <TextField
            required
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            required
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.location || submitting}
            >
              {submitting ? 'Submitting...' : editingSite ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SitesManagement;

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

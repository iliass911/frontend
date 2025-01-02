// src/pages/PreventiveMaintenance/admin/ProjectsManagement.js

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
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', year: '', siteId: '' });
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSites();
    fetchProjects();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
      alert('Failed to fetch sites.');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({ name: project.name, year: project.year, siteId: project.siteId });
    } else {
      setEditingProject(null);
      setFormData({ name: '', year: '', siteId: '' });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingProject(null);
    setFormData({ name: '', year: '', siteId: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData);
        alert('Project updated successfully.');
      } else {
        await api.post('/projects', formData);
        alert('Project added successfully.');
      }
      fetchProjects();
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Failed to submit project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        setProjects(projects.filter((project) => project.id !== id));
        alert('Project deleted successfully.');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project.');
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
        Projects
      </Typography>
      <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
        Add Project
      </Button>
      {projects.length === 0 ? (
        <Typography>No projects found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Site</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.year}</TableCell>
                <TableCell>
                  {sites.find((site) => site.id === project.siteId)?.name || 'N/A'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Project">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenModal(project)}
                      aria-label="edit project"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Project">
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(project.id)}
                      aria-label="delete project"
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

      {/* Modal for Add/Edit Project */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            {editingProject ? 'Edit Project' : 'Add Project'}
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
            type="number"
            label="Year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            sx={{ mb: 2 }}
            inputProps={{ min: 2000, max: 2100 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="site-select-label">Site</InputLabel>
            <Select
              labelId="site-select-label"
              label="Site"
              name="siteId"
              value={formData.siteId}
              onChange={handleChange}
            >
              {sites.map((site) => (
                <MenuItem key={site.id} value={site.id}>
                  {site.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.name || !formData.year || !formData.siteId || submitting}
            >
              {submitting ? 'Submitting...' : editingProject ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProjectsManagement;

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

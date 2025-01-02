// src/pages/Auth/RegisterPage.js

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/reducers/authReducer';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import logo from '../../assets/logo.png'; // Import the logo

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    matricule: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (message) {
      setSnackbar({ open: true, message: message, severity: 'success' });
      navigate('/login');
    }
  }, [message, navigate]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
    }
  }, [error]);

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #1976d2, #90caf9)', // Shades of blue
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative', // To position the logo absolutely
      }}
    >
      {/* Company Logo */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
        }}
      >
        <img src={logo} alt="Company Logo" style={{ width: '400px' }} />
      </Box>

      {/* Register Form Container */}
      <Box
        sx={{
          width: 400,
          p: 4,
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: 3,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
          Register
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <TextField
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <TextField
            required
            fullWidth
            label="Matricule"
            name="matricule"
            value={formData.matricule}
            onChange={handleChange}
            sx={{ mb: 3 }}
            variant="outlined"
            helperText="e.g., 90940, 23, 90941, 90948"
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              fontWeight: 'bold',
              py: 1.2,
              mb: 2,
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
        </form>
        <Typography variant="body2" color="textSecondary">
          Already have an account? <Link to="/login" style={{ color: '#1976d2', fontWeight: 'bold' }}>Login Here</Link>
        </Typography>
      </Box>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;
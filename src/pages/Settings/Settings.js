// src/pages/Settings/Settings.js

import React, { useState } from 'react'; 
import { Card, CardContent, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password) => {
    // Example: Minimum 8 characters, at least one letter and one number
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!validatePassword(passwords.newPassword)) {
      setError('Password must be at least 8 characters long and include both letters and numbers.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccess('Password updated successfully');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      // Optionally, redirect to Profile page
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh'
    }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Typography variant="h5">
            Change Password
          </Typography>
          
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
            />
            <Button 
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Changing...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

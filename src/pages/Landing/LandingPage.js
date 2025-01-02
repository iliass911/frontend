// src/pages/Landing/LandingPage.js

import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Box, Typography, Grid, Card, CardActionArea, CardContent, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import BuildIcon from '@mui/icons-material/Build';
import AssessmentIcon from '@mui/icons-material/Assessment';

const LandingPage = () => {
  const role = useSelector((state) => state.auth.role);
  const navigate = useNavigate();

  const options = [
    { title: 'Dashboard', icon: <DashboardIcon fontSize="large" />, path: '/dashboard', available: role === 'ADMIN' },
    { title: 'Inventory', icon: <InventoryIcon fontSize="large" />, path: '/inventory', available: true },
    { title: 'Maintenance', icon: <BuildIcon fontSize="large" />, path: '/maintenance', available: true },
    { title: 'Reports', icon: <AssessmentIcon fontSize="large" />, path: '/reports', available: true }, // Example additional option
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mt: 4 }}>
        Welcome to the Management System
      </Typography>
      <Typography variant="h6" align="center" gutterBottom sx={{ color: '#424242', mb: 4 }}>
        Please select an option below to proceed
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {options.map((option) => (
          option.available && (
            <Grid item xs={12} sm={6} md={3} key={option.title}>
              <Card sx={{ maxWidth: 345, '&:hover': { boxShadow: 6 } }}>
                <CardActionArea onClick={() => handleNavigate(option.path)}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                    {option.icon}
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div" align="center">
                      {option.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        ))}
      </Grid>
    </Box>
  );
};

export default LandingPage;

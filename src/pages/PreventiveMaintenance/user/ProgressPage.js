// src/pages/PreventiveMaintenance/user/ProgressPage.js

import React, { useEffect, useState } from 'react';
import api from '../../../api/api';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
} from '@mui/material';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId'); // Ensure userId is stored during login

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    try {
      const response = await api.get(`/checklists/user/${userId}/progress`); // Ensure this endpoint exists
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      alert('Failed to fetch progress data.');
    } finally {
      setLoading(false);
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
        Work Progress
      </Typography>
      {progressData.length === 0 ? (
        <Typography>No progress data available.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pack Name</TableCell>
              <TableCell>Total Boards</TableCell>
              <TableCell>Completed Boards</TableCell>
              <TableCell>In Progress Boards</TableCell>
              <TableCell>Completion Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {progressData.map((pack) => (
              <TableRow key={pack.packId}>
                <TableCell>{pack.packName}</TableCell>
                <TableCell>{pack.totalBoards}</TableCell>
                <TableCell>{pack.completedBoards}</TableCell>
                <TableCell>{pack.inProgressBoards}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress variant="determinate" value={pack.completionPercentage} />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {`${pack.completionPercentage}%`}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default ProgressPage;

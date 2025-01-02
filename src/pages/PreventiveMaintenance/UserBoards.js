// src/pages/PreventiveMaintenance/UserBoards.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Modal,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const UserBoards = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [checklistData, setChecklistData] = useState({
    equipmentDetails: '',
    startTime: null,
    endTime: null,
    duration: '',
    executionDate: null,
    nextScheduledDate: null,
    maintenanceStatus: false,
    observations: '',
    interveningDetails: '',
    signature: '',
  });

  const userId = localStorage.getItem('userId'); // Ensure userId is stored during login

  useEffect(() => {
    fetchBoards();
  }, [userId]);

  const fetchBoards = async () => {
    try {
      const response = await axios.get(`/api/boards/user/${userId}`);
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
      alert('Failed to fetch your boards.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (board) => {
    setCurrentBoard(board);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentBoard(null);
    setChecklistData({
      equipmentDetails: '',
      startTime: null,
      endTime: null,
      duration: '',
      executionDate: null,
      nextScheduledDate: null,
      maintenanceStatus: false,
      observations: '',
      interveningDetails: '',
      signature: '',
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChecklistData({
      ...checklistData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleDateChange = (name, date) => {
    setChecklistData({ ...checklistData, [name]: date });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...checklistData,
        boardId: currentBoard.id,
      };
      await axios.post('/api/checklists', payload);
      alert('Checklist submitted successfully.');
      handleClose();
    } catch (error) {
      console.error('Error submitting checklist:', error);
      alert('Failed to submit checklist.');
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
        My Boards
      </Typography>
      {boards.length === 0 ? (
        <Typography>No boards assigned to you.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Dimensions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boards.map((board) => (
              <TableRow key={board.id}>
                <TableCell>{board.name}</TableCell>
                <TableCell>{board.quantity}</TableCell>
                <TableCell>{board.dimensions}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleOpen(board)} sx={{ mr: 1 }}>
                    Fill Checklist
                  </Button>
                  {/* Implement Edit/Delete if necessary */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal for Filling Checklist */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Fill Checklist for {currentBoard?.name}
          </Typography>
          <TextField
            required
            fullWidth
            label="Equipment Details"
            name="equipmentDetails"
            value={checklistData.equipmentDetails}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            required
            fullWidth
            type="time"
            label="Start Time"
            name="startTime"
            value={checklistData.startTime || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            required
            fullWidth
            type="time"
            label="End Time"
            name="endTime"
            value={checklistData.endTime || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300, // 5 min
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            required
            fullWidth
            type="number"
            label="Duration (hours)"
            name="duration"
            value={checklistData.duration}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            required
            fullWidth
            type="date"
            label="Execution Date"
            name="executionDate"
            value={checklistData.executionDate || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="date"
            label="Next Scheduled Date"
            name="nextScheduledDate"
            value={checklistData.nextScheduledDate || ''}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <input
              type="checkbox"
              name="maintenanceStatus"
              checked={checklistData.maintenanceStatus}
              onChange={handleChange}
            />
            <Typography sx={{ ml: 1 }}>Maintenance Completed</Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observations"
            name="observations"
            value={checklistData.observations}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Intervening Details"
            name="interveningDetails"
            value={checklistData.interveningDetails}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Signature"
            name="signature"
            value={checklistData.signature}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!checklistData.equipmentDetails || !checklistData.duration}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default UserBoards;

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

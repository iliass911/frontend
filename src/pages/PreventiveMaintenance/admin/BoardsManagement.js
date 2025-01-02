// src/pages/PreventiveMaintenance/admin/BoardsManagement.js

import React, { useEffect, useState } from 'react';
import api from '../../../api/api';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import ReusableModal from '../../../components/common/ReusableModal';

const BoardsManagement = () => {
  const [boards, setBoards] = useState([]);
  const [packs, setPacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [formData, setFormData] = useState({
    packId: '',
    assignedUserId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [boardsRes, packsRes, usersRes] = await Promise.all([
        api.get('/boards'),
        api.get('/packs'),
        api.get('/users'),
      ]);
      setBoards(boardsRes.data);
      setPacks(packsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch data',
        severity: 'error',
      });
    }
  };

  const handleEditOpen = (board) => {
    setEditingBoard(board);
    setFormData({
      packId: board.packId || '',
      assignedUserId: board.assignedUserId || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBoard(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Updated handleSubmit function
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Create a copy of the board with updated relationships
      const updatedBoard = {
        ...editingBoard,
        packId: formData.packId || null,
        assignedUserId: formData.assignedUserId || null,
        // Ensure these fields are included if they exist
        fbName: editingBoard.fbName,
        fbSize: editingBoard.fbSize,
      };

      await api.put(`/boards/${editingBoard.id}`, updatedBoard);

      setSnackbar({
        open: true,
        message: 'Board assignments updated successfully!',
        severity: 'success',
      });
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error updating board:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update board assignments',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = [
    {
      label: 'Assign to Pack',
      name: 'packId',
      type: 'select',
      value: formData.packId,
      options: [
        { value: '', display: 'None' },
        ...packs.map((pack) => ({
          value: pack.id,
          display: pack.name,
        })),
      ],
    },
    {
      label: 'Assign to User',
      name: 'assignedUserId',
      type: 'select',
      value: formData.assignedUserId,
      options: [
        { value: '', display: 'None' },
        ...users.map((user) => ({
          value: user.id,
          display: user.username,
        })),
      ],
    },
  ];

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>FB Name</TableCell>
              <TableCell>FB Size</TableCell>
              <TableCell>Pack</TableCell>
              <TableCell>Assigned User</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boards.map((board) => (
              <TableRow key={board.id}>
                <TableCell>{board.id}</TableCell>
                <TableCell>{board.fbName}</TableCell>
                <TableCell>{board.fbSize}</TableCell>
                <TableCell>
                  {packs.find((pack) => pack.id === board.packId)?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  {users.find((user) => user.id === board.assignedUserId)?.username || 'Unassigned'}
                </TableCell>
                <TableCell>
                  <Tooltip title="Assign Pack/User">
                    <IconButton color="primary" onClick={() => handleEditOpen(board)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ReusableModal
        open={open}
        handleClose={handleClose}
        title="Assign Board"
        formFields={formFields}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        submitLabel="Save Assignments"
        submitting={submitting}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BoardsManagement;

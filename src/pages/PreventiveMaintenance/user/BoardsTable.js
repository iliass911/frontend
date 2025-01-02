// src/pages/PreventiveMaintenance/user/BoardsTable.js

import React, { useEffect, useState } from 'react';
import api from '../../../api/api';
import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button } from '@mui/material';

const BoardsTable = () => {
  const [boards, setBoards] = useState([]);
  const userId = useSelector((state) => state.auth.userId);

  const fetchBoards = async () => {
    if (!userId) {
      console.error('User ID is null.');
      return;
    }

    try {
      const response = await api.get(`/boards/user/${userId}`);
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [userId]);

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" gutterBottom component="div" sx={{ padding: 2 }}>
        Your Assigned Boards
      </Typography>
      <Table aria-label="boards table">
        <TableHead>
          <TableRow>
            <TableCell>Board ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Dimensions</TableCell>
            <TableCell>Pack ID</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {boards.map((board) => (
            <TableRow key={board.id}>
              <TableCell>{board.id}</TableCell>
              <TableCell>{board.name}</TableCell>
              <TableCell>{board.quantity}</TableCell>
              <TableCell>{board.dimensions}</TableCell>
              <TableCell>{board.packId}</TableCell>
              <TableCell>
                <Button variant="contained" color="primary" size="small">
                  View Checklist
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BoardsTable;

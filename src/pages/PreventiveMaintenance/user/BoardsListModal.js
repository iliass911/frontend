// src/pages/PreventiveMaintenance/user/BoardsListModal.js

import React, { useEffect, useState } from 'react';
import api from '../../../api/api';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Modal,
  Button,
  Tooltip,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import ChecklistModal from './ChecklistModal';

const BoardsListModal = ({ open, handleClose, pack }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openChecklistModal, setOpenChecklistModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    if (pack && open) {
      fetchBoards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack, open]);

  const fetchBoards = async () => {
    try {
      const response = await api.get(`/boards/pack/${pack.id}`); // Ensure this endpoint exists
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
      alert('Failed to fetch boards.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChecklistModal = (board) => {
    setSelectedBoard(board);
    setOpenChecklistModal(true);
  };

  const handleCloseChecklistModal = () => {
    setOpenChecklistModal(false);
    setSelectedBoard(null);
  };

  if (!pack) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Boards in {pack.name}
        </Typography>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '30vh',
            }}
          >
            <CircularProgress />
          </Box>
        ) : boards.length === 0 ? (
          <Typography>No boards found in this pack.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Board Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {boards.map((board) => (
                <TableRow key={board.id}>
                  <TableCell>{board.name}</TableCell>
                  <TableCell>
                    <Tooltip title="Fill Checklist">
                      <Button
                        variant="outlined"
                        onClick={() => handleOpenChecklistModal(board)}
                        sx={{ mr: 1 }}
                      >
                        Fill Checklist
                      </Button>
                    </Tooltip>
                    {/* Add more actions if needed */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Checklist Modal */}
        <ChecklistModal
          open={openChecklistModal}
          handleClose={handleCloseChecklistModal}
          board={selectedBoard}
        />
      </Box>
    </Modal>
  );
};

export default BoardsListModal;

// Styles for the Modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflowY: 'auto',
};

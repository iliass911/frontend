// src/pages/PreventiveMaintenance/user/PreventiveMaintenanceUserPage.js

import React, { useEffect, useState } from 'react';
import api from '../../../api/api';
import ReusableModal from '../../../components/common/ReusableModal';

import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  Button,
  Tooltip,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

const themeColors = {
  primary: '#1976d2',
  secondary: '#424242',
  assigned: '#1976d2',
  unassigned: '#e0e0e0',
  background: '#f0f4f8',
  tableHeader: '#0d47a1',
  textPrimary: '#212121',
  textSecondary: '#757575',
  assignedDark: '#115293',
  unassignedDark: '#bdbdbd',
};

const StyledTableCell = styled(TableCell)(() => ({
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background-color 0.3s, color 0.3s',
  textAlign: 'center',
  padding: '8px',
}));

const PreventiveMaintenanceUserPage = () => {
  const [sites, setSites] = useState([]);
  const [packs, setPacks] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [sitePacks, setSitePacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [openPacksModal, setOpenPacksModal] = useState(false);
  const [currentPack, setCurrentPack] = useState(null);

  const [openChecklistsModal, setOpenChecklistsModal] = useState(false);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [checklists, setChecklists] = useState([]);

  // Editing or adding a new checklist
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [openChecklistFormModal, setOpenChecklistFormModal] = useState(false);

  // NEW checklist form data, matching your new backend model
  const [checklistFormData, setChecklistFormData] = useState({
    boardId: '',
    technicianName: '',
    qualityAgentName: '',
    completionPercentage: 0,
    comments: '',
    qualityValidated: false,
    validationDate: null,
    expiryDate: null,
    workStatus: 'NOT_STARTED',
  });
  const [submittingChecklist, setSubmittingChecklist] = useState(false);

  const [boards, setBoards] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  /**
   * Fetch main data for this page, plus try /users if permitted.
   */
  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch main data in parallel (sites, packs, schedules, boards)
      const [sitesRes, packsRes, schedulesRes, boardsRes] = await Promise.all([
        api.get('/sites'),
        api.get('/packs'),
        api.get('/maintenance-schedules'),
        api.get('/boards'),
      ]);

      // Update state with main data
      setSites(sitesRes.data);
      setPacks(packsRes.data);
      setBoards(boardsRes.data);

      // Format schedules
      const formattedSchedules = {};
      schedulesRes.data.forEach((schedule) => {
        const { siteId, packId, weekNumber } = schedule;
        if (!formattedSchedules[siteId]) {
          formattedSchedules[siteId] = {};
        }
        if (!formattedSchedules[siteId][packId]) {
          formattedSchedules[siteId][packId] = [];
        }
        formattedSchedules[siteId][packId].push(weekNumber);
      });
      setSchedules(formattedSchedules);

      // Attempt fetching /users (admin-only or permitted roles)
      try {
        const usersRes = await api.get('/users');
        setUsers(usersRes.data);
      } catch (error) {
        console.log('Could not fetch /users, likely not permitted for this role.');
      }
    } catch (error) {
      console.error('Error fetching main data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch main data.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSiteChange = async (e) => {
    const siteId = e.target.value;
    setSelectedSiteId(siteId);

    try {
      const response = await api.get(`/packs/site/${siteId}`);
      setSitePacks(response.data);
    } catch (error) {
      console.error('Error fetching site packs:', error);
      setSnackbar({ open: true, message: 'Failed to fetch packs for selected site.', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  /**
   * If a cell is assigned, show pack details (boards).
   */
  const handleCellClick = (packId, weekNumber) => {
    const isAssigned = schedules[selectedSiteId]?.[packId]?.includes(weekNumber);
    if (!isAssigned) return;

    const pack = packs.find((p) => p.id === packId);
    setCurrentPack(pack);
    setOpenPacksModal(true);
  };

  const handleClosePacksModal = () => {
    setOpenPacksModal(false);
    setCurrentPack(null);
  };

  const getBoardsForCurrentPack = () => {
    if (!currentPack) return [];
    return boards.filter((board) => board.packId === currentPack.id);
  };

  /**
   * Show the checklists for a given board.
   */
  const handleOpenChecklistsModal = async (board) => {
    setCurrentBoard(board);
    try {
      const response = await api.get('/checklists');
      const boardChecklists = response.data.filter((c) => c.boardId === board.id);
      setChecklists(boardChecklists);
      setOpenChecklistsModal(true);
    } catch (error) {
      console.error('Error fetching checklists:', error);
      setSnackbar({ open: true, message: 'Failed to fetch checklists.', severity: 'error' });
    }
  };

  const handleCloseChecklistsModal = () => {
    setOpenChecklistsModal(false);
    setCurrentBoard(null);
    setChecklists([]);
  };

  /**
   * Checklist form (create or edit).
   */
  const handleOpenChecklistForm = (checklist = null) => {
    if (checklist) {
      // Edit mode
      setEditingChecklist(checklist);
      setChecklistFormData({
        boardId: checklist.boardId,
        technicianName: checklist.technicianName || '',
        qualityAgentName: checklist.qualityAgentName || '',
        completionPercentage: checklist.completionPercentage || 0,
        comments: checklist.comments || '',
        qualityValidated: checklist.qualityValidated || false,
        validationDate: checklist.validationDate || null,
        expiryDate: checklist.expiryDate || null,
        workStatus: checklist.workStatus || 'NOT_STARTED',
      });
    } else {
      // Add mode
      setEditingChecklist(null);
      setChecklistFormData({
        boardId: currentBoard.id,
        technicianName: '',
        qualityAgentName: '',
        completionPercentage: 0,
        comments: '',
        qualityValidated: false,
        validationDate: null,
        expiryDate: null,
        workStatus: 'NOT_STARTED',
      });
    }
    setOpenChecklistFormModal(true);
  };

  const handleCloseChecklistForm = () => {
    setOpenChecklistFormModal(false);
    setEditingChecklist(null);
  };

  /**
   * On form field change (including checkboxes).
   */
  const handleChecklistChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setChecklistFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setChecklistFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Submit the create/edit checklist form.
   */
  const handleChecklistSubmit = async () => {
    // Basic validation
    if (!checklistFormData.technicianName) {
      setSnackbar({ open: true, message: 'Technician name is required.', severity: 'warning' });
      return;
    }
    if (checklistFormData.qualityValidated && !checklistFormData.qualityAgentName) {
      setSnackbar({ open: true, message: 'Quality agent name is required when validated.', severity: 'warning' });
      return;
    }

    setSubmittingChecklist(true);
    try {
      if (editingChecklist) {
        // Update existing
        await api.put(`/checklists/${editingChecklist.id}`, checklistFormData);
        setSnackbar({ open: true, message: 'Checklist updated successfully!', severity: 'success' });
      } else {
        // Create new
        await api.post('/checklists', checklistFormData);
        setSnackbar({ open: true, message: 'Checklist created successfully!', severity: 'success' });
      }

      // Refresh checklist list
      const response = await api.get('/checklists');
      const boardChecklists = response.data.filter((c) => c.boardId === currentBoard.id);
      setChecklists(boardChecklists);

      // Close the modal
      handleCloseChecklistForm();
    } catch (error) {
      console.error('Error submitting checklist:', error);
      setSnackbar({ open: true, message: 'Failed to submit checklist.', severity: 'error' });
    } finally {
      setSubmittingChecklist(false);
    }
  };

  /**
   * Delete a checklist
   */
  const handleDeleteChecklist = async (id) => {
    if (window.confirm('Are you sure you want to delete this checklist?')) {
      try {
        await api.delete(`/checklists/${id}`);
        setSnackbar({ open: true, message: 'Checklist deleted successfully!', severity: 'success' });

        // Refresh
        const response = await api.get('/checklists');
        const boardChecklists = response.data.filter((c) => c.boardId === currentBoard?.id);
        setChecklists(boardChecklists);
      } catch (error) {
        console.error('Error deleting checklist:', error);
        setSnackbar({ open: true, message: 'Failed to delete checklist.', severity: 'error' });
      }
    }
  };

  // Loading UI
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          backgroundColor: themeColors.background,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: themeColors.background, minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ color: themeColors.primary, fontWeight: 'bold' }}>
        Preventive Maintenance (User View)
      </Typography>

      {/* Site Selector */}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="site-select-label">Select Site</InputLabel>
        <Select
          labelId="site-select-label"
          value={selectedSiteId}
          label="Select Site"
          onChange={handleSiteChange}
        >
          {sites.map((site) => (
            <MenuItem key={site.id} value={site.id}>
              {site.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedSiteId && (
        <>
          <Typography variant="h6" gutterBottom align="center" sx={{ color: themeColors.primary, fontWeight: 'bold' }}>
            Schedule for {sites.find((s) => s.id === selectedSiteId)?.name}
          </Typography>
          {sitePacks.length === 0 ? (
            <Typography variant="body1" align="center" sx={{ color: themeColors.textSecondary }}>
              No packs available for this site.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <StyledTableCell
                      sx={{
                        backgroundColor: themeColors.tableHeader,
                        color: 'white',
                        fontWeight: 'bold',
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                        minWidth: 150,
                      }}
                    >
                      Pack Name
                    </StyledTableCell>
                    {weeks.map((week) => (
                      <StyledTableCell
                        key={week}
                        align="center"
                        sx={{
                          backgroundColor: themeColors.tableHeader,
                          color: 'white',
                          fontWeight: 'bold',
                          minWidth: 80,
                        }}
                      >
                        Week {week}
                      </StyledTableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sitePacks.map((pack) => {
                    const isAssignedPack = schedules[selectedSiteId]?.[pack.id];
                    return (
                      <TableRow key={pack.id} hover>
                        <StyledTableCell
                          sx={{
                            backgroundColor: themeColors.tableHeader,
                            color: 'white',
                            fontWeight: 'bold',
                            position: 'sticky',
                            left: 0,
                            zIndex: 1,
                          }}
                        >
                          {pack.name}
                        </StyledTableCell>
                        {weeks.map((week) => {
                          const isAssigned = isAssignedPack?.includes(week);
                          return (
                            <StyledTableCell
                              key={week}
                              onClick={() => isAssigned && handleCellClick(pack.id, week)}
                              sx={{
                                bgcolor: isAssigned ? themeColors.assigned : themeColors.unassigned,
                                color: 'white',
                                height: '40px',
                                cursor: isAssigned ? 'pointer' : 'default',
                                '&:hover': {
                                  backgroundColor: isAssigned ? themeColors.assignedDark : themeColors.unassignedDark,
                                },
                                transition: 'background-color 0.3s',
                              }}
                            >
                              {isAssigned ? <CheckCircleIcon sx={{ color: 'white' }} /> : ''}
                            </StyledTableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Modal for viewing boards in a pack */}
      <Modal open={openPacksModal} onClose={handleClosePacksModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Boards in "{currentPack?.name}"
            </Typography>
            <IconButton onClick={handleClosePacksModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ mt: 2 }}>
            {getBoardsForCurrentPack().length === 0 ? (
              <Typography>No boards found for this pack.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table aria-label="boards table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>FB Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>FB Size</TableCell>
                      <TableCell align="right">Checklists</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getBoardsForCurrentPack().map((board) => (
                      <TableRow key={board.id}>
                        <TableCell>{board.id}</TableCell>
                        <TableCell>{board.fbName}</TableCell>
                        <TableCell>{board.quantity}</TableCell>
                        <TableCell>{board.fbSize}</TableCell>
                        <TableCell align="right">
                          <Button variant="outlined" onClick={() => handleOpenChecklistsModal(board)}>
                            View Checklists
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </Modal>

      {/* Modal for viewing checklists of a board */}
      <Modal open={openChecklistsModal} onClose={handleCloseChecklistsModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Checklists for Board "{currentBoard?.fbName}"
            </Typography>
            <IconButton onClick={handleCloseChecklistsModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ mt: 2 }}>
            {checklists.length === 0 ? (
              <Typography>No checklists found for this board.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table aria-label="checklists table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Technician</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Quality Check</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {checklists.map((cl) => (
                      <TableRow key={cl.id}>
                        <TableCell>{cl.technicianName}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={cl.completionPercentage}
                              sx={{ width: '100px', height: '10px' }}
                            />
                            <Typography variant="body2">{cl.completionPercentage}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cl.workStatus}
                            color={
                              cl.workStatus === 'COMPLETED'
                                ? 'success'
                                : cl.workStatus === 'IN_PROGRESS'
                                ? 'warning'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {cl.qualityValidated ? (
                            <Tooltip title={`Validated by ${cl.qualityAgentName}`}>
                              <CheckCircleIcon color="success" />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Pending validation">
                              <PendingIcon color="warning" />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View/Edit Checklist">
                            <IconButton color="primary" onClick={() => handleOpenChecklistForm(cl)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Checklist">
                            <IconButton color="error" onClick={() => handleDeleteChecklist(cl.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="contained" onClick={() => handleOpenChecklistForm()}>
                Add Checklist
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Reusable Modal for Add/Edit Checklist */}
      <ReusableModal
        open={openChecklistFormModal}
        handleClose={handleCloseChecklistForm}
        title={editingChecklist ? 'Edit Checklist' : 'Create Checklist'}
        formFields={[
          {
            label: 'Technician Name',
            name: 'technicianName',
            type: 'text',
            value: checklistFormData.technicianName,
            required: true,
            error: !checklistFormData.technicianName,
            helperText: !checklistFormData.technicianName ? 'Technician name is required' : '',
          },
          {
            label: 'Completion Percentage',
            name: 'completionPercentage',
            type: 'slider',
            value: checklistFormData.completionPercentage,
            required: true,
            min: 0,
            max: 100,
            step: 5,
            marks: [
              { value: 0, label: '0%' },
              { value: 25, label: '25%' },
              { value: 50, label: '50%' },
              { value: 75, label: '75%' },
              { value: 100, label: '100%' },
            ],
          },
          {
            label: 'Comments',
            name: 'comments',
            type: 'textarea',
            value: checklistFormData.comments,
            required: true,
            multiline: true,
            rows: 4,
            error: !checklistFormData.comments,
            helperText: !checklistFormData.comments ? 'Comments are required' : '',
          },
          {
            label: 'Quality Validation',
            name: 'qualityValidated',
            type: 'checkbox',
            value: checklistFormData.qualityValidated,
            required: false,
          },
          {
            label: 'Quality Agent Name',
            name: 'qualityAgentName',
            type: 'text',
            value: checklistFormData.qualityAgentName,
            required: checklistFormData.qualityValidated,
            error: checklistFormData.qualityValidated && !checklistFormData.qualityAgentName,
            helperText:
              checklistFormData.qualityValidated && !checklistFormData.qualityAgentName
                ? 'Quality agent name is required when validated'
                : '',
            disabled: !checklistFormData.qualityValidated,
          },
          {
            label: 'Work Status',
            name: 'workStatus',
            type: 'select',
            value: checklistFormData.workStatus,
            required: true,
            options: [
              { value: 'NOT_STARTED', display: 'Not Started' },
              { value: 'IN_PROGRESS', display: 'In Progress' },
              { value: 'COMPLETED', display: 'Completed' },
            ],
          },
          {
            label: 'Validation Date',
            name: 'validationDate',
            type: 'datetime-local',
            value: checklistFormData.validationDate ? checklistFormData.validationDate.slice(0, 16) : '',
            required: false,
          },
          {
            label: 'Expiry Date',
            name: 'expiryDate',
            type: 'datetime-local',
            value: checklistFormData.expiryDate ? checklistFormData.expiryDate.slice(0, 16) : '',
            required: false,
          },
        ]}
        handleChange={handleChecklistChange}
        handleSubmit={handleChecklistSubmit}
        submitLabel={editingChecklist ? 'Update' : 'Create'}
        submitting={submittingChecklist}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PreventiveMaintenanceUserPage;

// Modal styling for center screen
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: 600, md: 800 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

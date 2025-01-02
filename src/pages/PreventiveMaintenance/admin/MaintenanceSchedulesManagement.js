// src/pages/PreventiveMaintenance/admin/MaintenanceSchedulesManagement.js

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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Define a color palette matching your theme (blue, white, black)
const themeColors = {
  primary: '#1976d2', // MUI default blue
  secondary: '#424242', // Dark gray/black
  assigned: '#1976d2', // Blue for assigned cells
  unassigned: '#e0e0e0', // Light gray for unassigned cells
  background: '#f0f4f8', // Light blue/gray background
  tableHeader: '#0d47a1', // Darker blue for table headers
  textPrimary: '#212121', // Dark text
  textSecondary: '#757575', // Secondary text
  assignedDark: '#115293', // Darker shade for hover
  unassignedDark: '#bdbdbd', // Darker shade for hover
};

// Generate an array of weeks from 1 to 52
const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

// Styled components for better UX and aesthetics
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background-color 0.3s, color 0.3s',
  '&:hover': {
    opacity: 0.9,
  },
  textAlign: 'center',
  padding: '8px',
}));

const HeaderTypography = styled(Typography)(({ theme }) => ({
  color: themeColors.primary,
  fontWeight: 'bold',
}));

const LegendBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(2),
}));

const LegendItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(4),
}));

const ColorIndicator = styled(Box)(({ color }) => ({
  width: 16,
  height: 16,
  backgroundColor: color,
  borderRadius: '50%',
  marginRight: 8,
}));

const MaintenanceSchedulesManagement = () => {
  const [schedules, setSchedules] = useState({}); // { siteId: { packId: [weekNumbers] } }
  const [packs, setPacks] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [sitePacks, setSitePacks] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSites();
    fetchPacks();
    fetchSchedules();
    
  }, []);

  // Fetch all Sites
  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSnackbar({ open: true, message: 'Failed to fetch sites.', severity: 'error' });
    }
  };

  // Fetch all Packs
  const fetchPacks = async () => {
    try {
      const response = await api.get('/packs');
      setPacks(response.data);
    } catch (error) {
      console.error('Error fetching packs:', error);
      setSnackbar({ open: true, message: 'Failed to fetch packs.', severity: 'error' });
    }
  };

  // Fetch all Maintenance Schedules
  const fetchSchedules = async () => {
    try {
      const response = await api.get('/maintenance-schedules');
      // Assuming the backend returns an array of schedule assignments with siteId, packId, weekNumber, year
      const data = response.data;
      const formattedSchedules = {};

      data.forEach((schedule) => {
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
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSnackbar({ open: true, message: 'Failed to fetch schedules.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Site Selection
  const handleSiteChange = async (e) => {
    const siteId = e.target.value;
    setSelectedSiteId(siteId);
    // Fetch Packs associated with this Site
    try {
      const response = await api.get(`/packs/site/${siteId}`); // Ensure this endpoint exists
      setSitePacks(response.data);
    } catch (error) {
      console.error('Error fetching site packs:', error);
      setSnackbar({ open: true, message: 'Failed to fetch packs for the selected site.', severity: 'error' });
    }
  };

  // Handle Cell Click for Assigning/Unassigning Packs to Weeks
  const handleCellClick = async (packId, weekNumber) => {
    if (!selectedSiteId) {
      setSnackbar({ open: true, message: 'Please select a site first.', severity: 'warning' });
      return;
    }

    const isAssigned = schedules[selectedSiteId]?.[packId]?.includes(weekNumber);

    if (isAssigned) {
      // Add confirmation before unassigning
      const confirmUnassign = window.confirm('Are you sure you want to unassign this pack from the selected week?');
      if (!confirmUnassign) return;

      // Unassign the pack from the week
      try {
        await api.delete('/maintenance-schedules', { data: { siteId: selectedSiteId, packId, weekNumber } });
        setSnackbar({ open: true, message: 'Pack unassigned from week successfully!', severity: 'success' });

        // Update local state immutably
        setSchedules((prevSchedules) => {
          const updatedSchedules = { ...prevSchedules };
          if (updatedSchedules[selectedSiteId] && updatedSchedules[selectedSiteId][packId]) {
            updatedSchedules[selectedSiteId][packId] = updatedSchedules[selectedSiteId][packId].filter(
              (week) => week !== weekNumber
            );
            // Clean up if no weeks are assigned
            if (updatedSchedules[selectedSiteId][packId].length === 0) {
              delete updatedSchedules[selectedSiteId][packId];
            }
          } else {
            console.error(`Attempting to delete week ${weekNumber} from undefined packId ${packId} for siteId ${selectedSiteId}`);
          }
          return updatedSchedules;
        });
      } catch (error) {
        console.error('Error unassigning pack from week:', error);
        setSnackbar({ open: true, message: 'Failed to unassign pack from week.', severity: 'error' });
      }
    } else {
      // Assign the pack to the week
      try {
        await api.post('/maintenance-schedules', {
          siteId: selectedSiteId,
          packId: packId,
          weekNumber: parseInt(weekNumber, 10),
          year: new Date().getFullYear(),
        });
        setSnackbar({ open: true, message: 'Pack assigned to week successfully!', severity: 'success' });

        // Update local state immutably
        setSchedules((prevSchedules) => {
          const updatedSchedules = { ...prevSchedules };
          if (!updatedSchedules[selectedSiteId]) {
            updatedSchedules[selectedSiteId] = {};
          }
          if (!updatedSchedules[selectedSiteId][packId]) {
            updatedSchedules[selectedSiteId][packId] = [];
          }
          updatedSchedules[selectedSiteId][packId] = [
            ...updatedSchedules[selectedSiteId][packId],
            weekNumber,
          ];
          return updatedSchedules;
        });
      } catch (error) {
        console.error('Error assigning pack to week:', error);
        setSnackbar({ open: true, message: 'Failed to assign pack to week.', severity: 'error' });
      }
    }
  };

  // Handle Snackbar Close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
      <HeaderTypography variant="h4" gutterBottom align="center">
        Maintenance Schedules Management
      </HeaderTypography>
      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={4}>
        {/* Site Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="site-select-label" sx={{ color: themeColors.secondary }}>
              Select Site
            </InputLabel>
            <Select
              labelId="site-select-label"
              value={selectedSiteId}
              label="Select Site"
              onChange={handleSiteChange}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeColors.primary,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: themeColors.primary,
                },
                '& .MuiSvgIcon-root ': {
                  fill: themeColors.primary,
                },
                color: themeColors.textPrimary,
                '& .MuiInputLabel-root': {
                  color: themeColors.secondary,
                },
              }}
            >
              {sites.map((site) => (
                <MenuItem key={site.id} value={site.id}>
                  {site.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Legend */}
        <Grid item xs={12} md={6}>
          <LegendBox>
            <LegendItem>
              <ColorIndicator color={themeColors.assigned} />
              <Typography variant="body1" color={themeColors.textPrimary}>
                Assigned
              </Typography>
            </LegendItem>
            <LegendItem>
              <ColorIndicator color={themeColors.unassigned} />
              <Typography variant="body1" color={themeColors.textPrimary}>
                Unassigned
              </Typography>
            </LegendItem>
          </LegendBox>
        </Grid>
      </Grid>

      {/* Schedule Table */}
      {selectedSiteId && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom align="center" color={themeColors.primary}>
            Schedule Packs for {sites.find((site) => site.id === selectedSiteId)?.name}
          </Typography>
          {sitePacks.length === 0 ? (
            <Typography variant="body1" align="center" color={themeColors.textSecondary}>
              No packs available for this site.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflowX: 'auto' }}>
              <Table stickyHeader aria-label="maintenance schedules table">
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
                  {sitePacks.map((pack) => (
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
                        const isAssigned = schedules[selectedSiteId]?.[pack.id]?.includes(week);
                        return (
                          <Tooltip
                            key={week}
                            title={isAssigned ? 'Assigned' : 'Unassigned'}
                            arrow
                            placement="top"
                          >
                            <StyledTableCell
                              onClick={() => handleCellClick(pack.id, week)}
                              sx={{
                                bgcolor: isAssigned ? themeColors.assigned : themeColors.unassigned,
                                color: 'white',
                                height: '40px',
                                '&:hover': {
                                  backgroundColor: isAssigned
                                    ? themeColors.assignedDark
                                    : themeColors.unassignedDark,
                                },
                                transition: 'background-color 0.3s',
                              }}
                            >
                              {isAssigned ? <CheckCircleIcon sx={{ color: 'white' }} /> : ''}
                            </StyledTableCell>
                          </Tooltip>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Snackbar for Notifications */}
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

export default MaintenanceSchedulesManagement;

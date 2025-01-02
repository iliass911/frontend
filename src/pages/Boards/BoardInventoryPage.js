// src/pages/Boards/BoardInventoryPage.js 

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Button,
  IconButton,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Snackbar,
  Alert,
  InputAdornment,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DataGrid } from '@mui/x-data-grid';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { debounce } from 'lodash';
import api from '../../api/api';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Initialize all form fields with proper default values to prevent controlled/uncontrolled input warnings
const initialFormState = {
  fbName: '',
  fbSize: '',
  firstTechLevel: '',
  projet: '',
  plant: '',
  storagePlace: '',
  inUse: '',
  testClip: false,
  area: '',
  fbType1: '',
  fbType2: '',
  fbType3: '',
  side: '',
  derivate: '',
  creationReason: '',
  firstYellowReleaseDate: null,
  firstOrangeReleaseDate: null,
  firstGreenReleaseDate: null,
  firstUseByProdDate: null,
  currentTechLevel: '',
  nextTechLevel: '',
  lastTechChangeImplemented: '',
  lastTechChangeImpleDate: null,
  lastTechChangeReleaseDate: null,
  comment1: '',
  comment2: '',
  comment3: '',
  fbId: '',
  cost: '',
  quantity: 1,
  packId: null,
  assignedUserId: null,
};

const BoardInventoryPage = () => {
  const [boards, setBoards] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [boardTypes, setBoardTypes] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    projet: '',
    plant: '',
    fbType1: '',
  });
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState(initialFormState);
  const [chartData, setChartData] = useState([]);

  // Fetch distinct values for filters
  useEffect(() => {
    fetchDistinctValues();
  }, []);

  const fetchDistinctValues = async () => {
    try {
      const [projectsRes, sitesRes, boardTypesRes] = await Promise.all([
        api.get('/boards/projets'), // Updated endpoint if necessary
        api.get('/boards/plants'),  // Updated endpoint if necessary
        api.get('/boards/fbTypes1'), // Updated endpoint if necessary
      ]);
      setProjects(projectsRes.data);
      setSites(sitesRes.data);
      setBoardTypes(boardTypesRes.data);
    } catch (error) {
      console.error('Error fetching filter values:', error);
      handleSnackbar('Failed to fetch filter options', 'error');
    }
  };

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters((prev) => ({ ...prev, search: value }));
      }, 500),
    []
  );

  useEffect(() => {
    fetchBoards();
    // Cleanup debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
   
  }, [filters]);

  const fetchBoards = async () => {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.projet) params.projet = filters.projet;
      if (filters.plant) params.plant = filters.plant;
      if (filters.fbType1) params.fbType1 = filters.fbType1;

      const response = await api.get('/boards', { params });
      console.log('Fetched boards:', response.data);
      setBoards(response.data);
      generateChartData(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
      handleSnackbar('Failed to fetch boards', 'error');
    }
  };

  const generateChartData = (data) => {
    const projetCounts = data.reduce((acc, board) => {
      acc[board.projet] = (acc[board.projet] || 0) + 1;
      return acc;
    }, {});

    const chart = Object.keys(projetCounts).map((projet) => ({
      projet,
      count: projetCounts[projet],
    }));

    setChartData(chart);
  };

  const handleChangePageSize = (newPageSize) => {
    setPageSize(newPageSize);
  };

  const handleOpenDialog = (board = null) => {
    if (board) {
      console.log('Opening dialog with board:', board);
      setSelectedBoard(board);
      setFormData({
        ...board,
        firstYellowReleaseDate: board.firstYellowReleaseDate ? new Date(board.firstYellowReleaseDate) : null,
        firstOrangeReleaseDate: board.firstOrangeReleaseDate ? new Date(board.firstOrangeReleaseDate) : null,
        firstGreenReleaseDate: board.firstGreenReleaseDate ? new Date(board.firstGreenReleaseDate) : null,
        firstUseByProdDate: board.firstUseByProdDate ? new Date(board.firstUseByProdDate) : null,
        lastTechChangeImpleDate: board.lastTechChangeImpleDate ? new Date(board.lastTechChangeImpleDate) : null,
        lastTechChangeReleaseDate: board.lastTechChangeReleaseDate ? new Date(board.lastTechChangeReleaseDate) : null,
        creationDate: board.creationDate ? new Date(board.creationDate) : null,
        cost: board.cost || '',
        quantity: board.quantity || 1,
      });
    } else {
      setSelectedBoard(null);
      setFormData(initialFormState);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBoard(null);
    setFormData(initialFormState);
  };

  // Handle input changes for text fields and checkboxes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue;

    switch (type) {
      case 'checkbox':
        finalValue = checked;
        break;
      case 'number':
        finalValue = value === '' ? '' : name === 'cost' ? parseFloat(value) : parseInt(value, 10);
        break;
      default:
        finalValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    console.log(`Setting ${name} to:`, date);
    setFormData((prev) => ({
      ...prev,
      [name]: date ? new Date(date) : null,
    }));
  };

  // Handle form submission for creating/updating boards
  const handleSubmit = async () => {
    try {
      // Prepare submission data with proper formatting
      const submissionData = {
        ...formData,
        // Format dates to 'YYYY-MM-DD' or set to null
        firstYellowReleaseDate: formData.firstYellowReleaseDate
          ? formData.firstYellowReleaseDate.toISOString().split('T')[0]
          : null,
        firstOrangeReleaseDate: formData.firstOrangeReleaseDate
          ? formData.firstOrangeReleaseDate.toISOString().split('T')[0]
          : null,
        firstGreenReleaseDate: formData.firstGreenReleaseDate
          ? formData.firstGreenReleaseDate.toISOString().split('T')[0]
          : null,
        firstUseByProdDate: formData.firstUseByProdDate
          ? formData.firstUseByProdDate.toISOString().split('T')[0]
          : null,
        lastTechChangeImpleDate: formData.lastTechChangeImpleDate
          ? formData.lastTechChangeImpleDate.toISOString().split('T')[0]
          : null,
        lastTechChangeReleaseDate: formData.lastTechChangeReleaseDate
          ? formData.lastTechChangeReleaseDate.toISOString().split('T')[0]
          : null,
        creationDate: formData.creationDate
          ? formData.creationDate.toISOString().split('T')[0]
          : null,
        // Ensure numbers are correctly formatted
        quantity: formData.quantity ? parseInt(formData.quantity, 10) : 1,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        // Ensure boolean is properly set
        testClip: Boolean(formData.testClip),
      };

      console.log('Submitting board data:', submissionData);

      if (selectedBoard) {
        await api.put(`/boards/${selectedBoard.id}`, submissionData);
        handleSnackbar('Board updated successfully', 'success');
      } else {
        await api.post('/boards', submissionData);
        handleSnackbar('Board created successfully', 'success');
      }
      fetchBoards();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving board:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Failed to save board';
      handleSnackbar(errorMessage, 'error');
    }
  };

  // Handle board deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await api.delete(`/boards/${id}`);
        handleSnackbar('Board deleted successfully', 'success');
        fetchBoards();
      } catch (error) {
        console.error('Error deleting board:', error);
        handleSnackbar('Failed to delete board', 'error');
      }
    }
  };

  // Handle snackbar notifications
  const handleSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Export boards to Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(boards);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Boards');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'board_inventory.xlsx');
  };

  // Define columns for DataGrid with updated field names
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fbName', headerName: 'FB Name', width: 150, sortable: true },
    { field: 'fbSize', headerName: 'FB Size', width: 130 },
    { field: 'firstTechLevel', headerName: '1st Tech Level', width: 150 },
    { field: 'projet', headerName: 'Projet', width: 130 },
    { field: 'plant', headerName: 'Plant', width: 120 },
    { field: 'storagePlace', headerName: 'Storage Place', width: 150 },
    { field: 'inUse', headerName: 'In Use', width: 120 },
    {
      field: 'testClip',
      headerName: 'Test Clip',
      width: 100,
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
      sortable: true,
    },
    { field: 'fbType1', headerName: 'FB Type 1', width: 130 },
    { field: 'fbType2', headerName: 'FB Type 2', width: 130 },
    { field: 'fbType3', headerName: 'FB Type 3', width: 130 },
    { field: 'side', headerName: 'Side', width: 120 },
    { field: 'derivate', headerName: 'Derivate', width: 130 },
    { field: 'creationReason', headerName: 'Creation Reason', width: 160 },
    { field: 'firstYellowReleaseDate', headerName: '1st Yellow Release', width: 150 },
    { field: 'firstOrangeReleaseDate', headerName: '1st Orange Release', width: 160 },
    { field: 'firstGreenReleaseDate', headerName: '1st Green Release', width: 150 },
    { field: 'firstUseByProdDate', headerName: '1st Use by Prod Date', width: 180 },
    { field: 'currentTechLevel', headerName: 'Current Tech Level', width: 160 },
    { field: 'nextTechLevel', headerName: 'Next Tech Level', width: 140 },
    { field: 'lastTechChangeImplemented', headerName: 'Last Tech Change Implemented', width: 220 },
    { field: 'lastTechChangeImpleDate', headerName: 'Last Tech Change Imple Date', width: 180 },
    { field: 'lastTechChangeReleaseDate', headerName: 'Last Tech Change Release Date', width: 220 },
    { field: 'comment1', headerName: 'Comment 1', width: 200 },
    { field: 'comment2', headerName: 'Comment 2', width: 200 },
    { field: 'comment3', headerName: 'Comment 3', width: 200 },
    { field: 'fbId', headerName: 'FB ID', width: 130 },
    { field: 'cost', headerName: 'Cost', width: 100, type: 'number', sortable: true },
    { field: 'quantity', headerName: 'Quantity', width: 100, type: 'number', sortable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDialog(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header with Title and Create Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Board Inventory
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Board
          </Button>
        </Box>

        {/* Toolbar with Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Bar */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search by FB Name"
                placeholder="Search..."
                onChange={(e) => debouncedSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Projet Filter */}
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                variant="outlined"
                label="Projet"
                name="projet"
                value={filters.projet}
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {projects.map((projet) => (
                  <MenuItem key={projet} value={projet}>
                    {projet}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Plant Filter */}
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                variant="outlined"
                label="Plant"
                name="plant"
                value={filters.plant}
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {sites.map((plant) => (
                  <MenuItem key={plant} value={plant}>
                    {plant}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* FB Type 1 Filter */}
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                variant="outlined"
                label="FB Type 1"
                name="fbType1"
                value={filters.fbType1}
                onChange={handleFilterChange}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {boardTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Export Button */}
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                fullWidth
              >
                Export Excel
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* DataGrid Table */}
        <Paper sx={{ height: 600, width: '100%', mb: 3 }}>
          <DataGrid
            rows={boards}
            columns={columns}
            pageSize={pageSize}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            pagination
            disableSelectionOnClick
            autoHeight
          />
        </Paper>

        {/* Data Visualization: Bar Chart */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Boards per Projet
          </Typography>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="projet" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body1">No data available for visualization.</Typography>
          )}
        </Paper>

        {/* Dialog for Adding/Editing Board */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
          <DialogTitle>{selectedBoard ? 'Edit Board' : 'Add New Board'}</DialogTitle>
          <DialogContent>
            {/* Using Accordions to categorize form fields */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">General Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* FB Name */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="FB Name"
                      name="fbName"
                      value={formData.fbName}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>

                  {/* FB Size */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="FB Size"
                      name="fbSize"
                      value={formData.fbSize}
                      onChange={handleInputChange}
                      required
                      error={!formData.fbSize}
                      helperText={!formData.fbSize ? 'FB Size is required' : ''}
                    />
                  </Grid>

                  {/* Projet */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Projet"
                      name="projet"
                      value={formData.projet}
                      onChange={handleInputChange}
                      select
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {projects.map((projet) => (
                        <MenuItem key={projet} value={projet}>
                          {projet}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Plant */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Plant"
                      name="plant"
                      value={formData.plant}
                      onChange={handleInputChange}
                      select
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {sites.map((plant) => (
                        <MenuItem key={plant} value={plant}>
                          {plant}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Technical Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* 1st Tech Level */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="1st Tech Level"
                      name="firstTechLevel"
                      value={formData.firstTechLevel}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Current Tech Level */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Current Tech Level"
                      name="currentTechLevel"
                      value={formData.currentTechLevel}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Next Tech Level */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Next Tech Level"
                      name="nextTechLevel"
                      value={formData.nextTechLevel}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* FB Type 1 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="FB Type 1"
                      name="fbType1"
                      value={formData.fbType1}
                      onChange={handleInputChange}
                      select
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {boardTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* FB Type 2 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="FB Type 2"
                      name="fbType2"
                      value={formData.fbType2}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* FB Type 3 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="FB Type 3"
                      name="fbType3"
                      value={formData.fbType3}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Side */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Side"
                      name="side"
                      value={formData.side}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Derivate */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Derivate"
                      name="derivate"
                      value={formData.derivate}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Creation Reason */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Creation Reason"
                      name="creationReason"
                      value={formData.creationReason}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Release Dates</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* 1st Yellow Release Date */}
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="1st Yellow Release Date"
                      value={formData.firstYellowReleaseDate}
                      onChange={(date) => handleDateChange('firstYellowReleaseDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>

                  {/* 1st Orange Release Date */}
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="1st Orange Release Date"
                      value={formData.firstOrangeReleaseDate}
                      onChange={(date) => handleDateChange('firstOrangeReleaseDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>

                  {/* 1st Green Release Date */}
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="1st Green Release Date"
                      value={formData.firstGreenReleaseDate}
                      onChange={(date) => handleDateChange('firstGreenReleaseDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>

                  {/* 1st Use by Prod Date */}
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="1st Use by Prod Date"
                      value={formData.firstUseByProdDate}
                      onChange={(date) => handleDateChange('firstUseByProdDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>

                  {/* Last Tech Change Imple Date */}
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Last Tech Change Imple Date"
                      value={formData.lastTechChangeImpleDate}
                      onChange={(date) => handleDateChange('lastTechChangeImpleDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>

                  {/* Last Tech Change Release Date */}
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Last Tech Change Release Date"
                      value={formData.lastTechChangeReleaseDate}
                      onChange={(date) => handleDateChange('lastTechChangeReleaseDate', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Additional Information</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Test Clip */}
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.testClip}
                          onChange={handleInputChange}
                          name="testClip"
                        />
                      }
                      label="Test Clip"
                    />
                  </Grid>

                  {/* Storage Place */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Storage Place"
                      name="storagePlace"
                      value={formData.storagePlace}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Cost */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Cost"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: '0.01' }}
                    />
                  </Grid>

                  {/* Quantity */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      inputProps={{ min: 1, step: '1' }}
                    />
                  </Grid>

                  {/* FB ID */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="FB ID"
                      name="fbId"
                      value={formData.fbId}
                      onChange={handleInputChange}
                    />
                  </Grid>

                  {/* Comments */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Comments
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Comment 1"
                      name="comment1"
                      value={formData.comment1}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Comment 2"
                      name="comment2"
                      value={formData.comment2}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Comment 3"
                      name="comment3"
                      value={formData.comment3}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedBoard ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default BoardInventoryPage;

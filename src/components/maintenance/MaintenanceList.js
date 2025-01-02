import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit, Delete, Search, AddCircleOutline } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../../api/api';

const MaintenanceList = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [availableSites, setAvailableSites] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch available sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await api.get('/sites');
        // Ensure we're using an array of strings
        const siteNames = response.data.map(site => 
          typeof site === 'object' ? (site.name || site.siteName || '') : site
        ).filter(site => site); // Remove any empty strings
        
        setAvailableSites(siteNames);
      } catch (error) {
        console.error('Error fetching sites:', error);
        setError('Failed to fetch sites');
      }
    };
    fetchSites();
  }, []);

  // Search and filter function
  const searchMaintenance = useCallback(async () => {
    // If no search criteria, clear results
    if (!searchTerm && !selectedSite && !dateRange.startDate && !dateRange.endDate) {
      setMaintenance([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/maintenance`, {
        params: {
          search: searchTerm || undefined,
          site: selectedSite || undefined,
          startDate: dateRange.startDate ? dateRange.startDate.toISOString() : undefined,
          endDate: dateRange.endDate ? dateRange.endDate.toISOString() : undefined
        }
      });
      
      // Client-side filtering for additional precision
      const filteredResults = response.data.filter(item => {
        const matchesSearch = !searchTerm || 
          ['typeIntervention', 'pointExaminer', 'natureIntervention', 
           'posteTouche', 'zone', 'nomPrenomBB', 'site', 'shift']
            .some(field => 
              item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        
        const matchesSite = !selectedSite || item.site === selectedSite;
        
        const matchesDateRange = (!dateRange.startDate || new Date(item.date) >= dateRange.startDate) &&
                                  (!dateRange.endDate || new Date(item.date) <= dateRange.endDate);
        
        return matchesSearch && matchesSite && matchesDateRange;
      });
      
      setMaintenance(filteredResults);
    } catch (error) {
      console.error('Error searching maintenance:', error);
      setError('Failed to fetch maintenance records');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedSite, dateRange]);

  // Trigger search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMaintenance();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSite, dateRange, searchMaintenance]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this intervention?')) {
      try {
        await api.delete(`/maintenance/${id}`);
        setMaintenance(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting intervention:', error);
        setError('Failed to delete the intervention');
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSite('');
    setDateRange({ startDate: null, endDate: null });
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Error Snackbar */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseError} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>

        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
          Maintenance Interventions
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by type, point, nature, post, zone, BB name, site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Site</InputLabel>
              <Select
                value={selectedSite}
                label="Site"
                onChange={(e) => setSelectedSite(e.target.value)}
              >
                <MenuItem value="">All Sites</MenuItem>
                {availableSites.map((site) => (
                  <MenuItem key={site} value={site}>
                    {site}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, startDate: newValue }))}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, endDate: newValue }))}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
            
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutline />}
              onClick={() => navigate('/maintenance/add')}
            >
              Add New Intervention
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                {[
                  'ID', 'Type', 'Value (€)', 'Point', 'Nature', 'Post', 'Zone', 'Shift',
                  'Panel', 'BB Name', 'Time (h)', 'Date', 'Comment', 'Site', 'Actions'
                ].map(header => (
                  <TableCell key={header} sx={{ color: 'white', fontWeight: 'bold' }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : maintenance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    No matching interventions found
                  </TableCell>
                </TableRow>
              ) : (
                maintenance.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.typeIntervention}</TableCell>
                    <TableCell>{item.valeurEuro}</TableCell>
                    <TableCell>{item.pointExaminer}</TableCell>
                    <TableCell>{item.natureIntervention}</TableCell>
                    <TableCell>{item.posteTouche}</TableCell>
                    <TableCell>{item.zone}</TableCell>
                    <TableCell>{item.shift}</TableCell>
                    <TableCell>{item.numeroPanneau}</TableCell>
                    <TableCell>{item.nomPrenomBB}</TableCell>
                    <TableCell>{item.tempsIntervention}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.commentaire}</TableCell>
                    <TableCell>{item.site}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => navigate(`/maintenance/edit/${item.id}`)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </LocalizationProvider>
  );
};

export default MaintenanceList;
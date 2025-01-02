// src/pages/Dashboard/DashboardPage.js

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  TrendingUp as TrendUpIcon, 
  TrendingDown as TrendDownIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useTheme } from '@mui/material/styles';
import api from '../../api/api'; // Ensure this path is correct
import { format } from 'date-fns';

// Define a diverse blue color palette
const COLORS = [
  '#0D47A1', // Dark Blue
  '#1565C0', // Medium Blue
  '#1976D2', // Blue
  '#1E88E5', // Light Blue
  '#2196F3', // Sky Blue
  '#42A5F5', // Lighter Sky Blue
  '#64B5F6', // Powder Blue
  '#90CAF9', // Pale Blue
  '#BBDEFB', // Very Pale Blue
  '#E3F2FD', // Almost White Blue
  '#FFB300', // Amber for potential 'Others' category
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    console.log('Tooltip Payload:', payload); // Debugging
    const { name, value, percent } = payload[0];
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: 3,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography variant="body2">Value: {value}</Typography>
        <Typography variant="body2">
          Percentage: {(percent * 100).toFixed(2)}%
        </Typography>
      </Box>
    );
  }

  return null;
};

// Reusable Chart Wrapper Component
const ChartWrapper = ({ title, children }) => {
  const theme = useTheme();
  return (
    <Paper sx={{ p: 2, height: '100%', backgroundColor: theme.palette.background.paper }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
};

// Reusable Summary Card Component (if needed)
const SummaryCard = ({ title, value, icon, trend }) => {
  const theme = useTheme();
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box display="flex" alignItems="center">
        {icon}
        <Box ml={2}>
          <Typography variant="h5" color="primary">
            {value}
          </Typography>
          {trend !== undefined && (
            <Box display="flex" alignItems="center">
              {trend > 0 ? <TrendUpIcon color="success" /> : <TrendDownIcon color="error" />}
              <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'} ml={0.5}>
                {trend > 0 ? 'Increase' : 'Decrease'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const DashboardPage = () => {
  // State Variables
  const [inventoryData, setInventoryData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [tabValue, setTabValue] = useState(0); // 0: All Top 10, 1: Inventory Top 10, 2: Maintenance Top 10

  // Access the theme using the useTheme hook
  const theme = useTheme();

  // Fetch Data on Component Mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [inventoryResponse, maintenanceResponse] = await Promise.all([
        api.get('/inventory'),
        api.get('/maintenance'),
      ]);
      setInventoryData(inventoryResponse.data);
      setMaintenanceData(maintenanceResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch dashboard data.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get a safe name for inventory
  const getInventoryName = useCallback((item) => {
    return item.refCode && item.refCode.trim() !== '' ? item.refCode : 'No Ref Code';
  }, []);

  // Helper to get a safe name for maintenance
  const getMaintenanceName = useCallback((type) => {
    return type && type.trim() !== '' ? type : 'No Type';
  }, []);

  // --- Top 10 Analyses ---

  // Top 10 Inventory Items by Quantity
  const top10InventoryQuantity = useMemo(() => {
    return [...inventoryData]
      .map(item => ({
        name: getInventoryName(item),
        quantity: Number(item.quantity) || 0,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [inventoryData, getInventoryName]);

  // Top 10 Inventory Items by Total Value
  const top10InventoryValue = useMemo(() => {
    return [...inventoryData]
      .map(item => ({
        name: getInventoryName(item),
        totalValue: (Number(item.price) || 0) * (Number(item.quantity) || 0),
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
  }, [inventoryData, getInventoryName]);

  // Top 10 Maintenance Interventions by Frequency
  const top10MaintenanceFrequency = useMemo(() => {
    const freq = maintenanceData.reduce((acc, item) => {
      const typeName = getMaintenanceName(item.typeIntervention);
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(freq)
      .map(([key, value]) => ({ type: key, frequency: Number(value) }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }, [maintenanceData, getMaintenanceName]);

  // Top 10 Maintenance Interventions by Cost
  const top10MaintenanceCost = useMemo(() => {
    const cost = maintenanceData.reduce((acc, item) => {
      const typeName = getMaintenanceName(item.typeIntervention);
      acc[typeName] = (acc[typeName] || 0) + (Number(item.valeurEuro) || 0);
      return acc;
    }, {});
    return Object.entries(cost)
      .map(([key, value]) => ({ type: key, totalCost: Number(value) }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10);
  }, [maintenanceData, getMaintenanceName]);

  // --- Site Nature Analysis ---

  // Site Nature Analysis Method
  const analyzeSiteMaintenanceNature = useCallback(() => {
    // Get unique sites
    const sites = [...new Set(maintenanceData.map(item => item.site))];

    // Get unique nature types
    const natureTypes = [
      ...new Set(maintenanceData.map(item => item.natureIntervention || 'Undefined')),
    ];

    // Initialize data structure for stacked bar chart
    const data = sites.map(site => {
      const siteMaintenance = maintenanceData.filter(item => item.site === site);
      const totalInterventions = siteMaintenance.length;
      const siteData = { site };
      natureTypes.forEach(nature => {
        const count = siteMaintenance.filter(item => (item.natureIntervention || 'Undefined') === nature).length;
        siteData[nature] = totalInterventions ? ((count / totalInterventions) * 100).toFixed(2) : 0;
      });
      return siteData;
    });

    return { data, natureTypes };
  }, [maintenanceData]);

  // --- Inventory Distribution Pie Chart Data (Top 10) ---

  const inventoryDistribution = useMemo(() => {
    const distribution = inventoryData.reduce((acc, item) => {
      const type = item.type || 'Undefined';
      acc[type] = (acc[type] || 0) + (Number(item.quantity) || 0);
      return acc;
    }, {});

    // Convert to array and sort by quantity descending
    let sortedDistribution = Object.entries(distribution)
      .map(([key, value]) => ({ name: key, value: Number(value) }))
      .sort((a, b) => b.value - a.value);

    // Handle 'Others' if there are more than 10 categories
    if (sortedDistribution.length > 10) {
      const others = {
        name: 'Others',
        value: sortedDistribution.slice(10).reduce((acc, curr) => acc + Number(curr.value), 0),
      };
      sortedDistribution = sortedDistribution.slice(0, 10);
      sortedDistribution.push(others);
    }

    return sortedDistribution;
  }, [inventoryData]);

  // --- Maintenance Type Distribution Pie Chart Data (Top 10) ---

  const maintenanceTypeDistribution = useMemo(() => {
    const distribution = maintenanceData.reduce((acc, item) => {
      const type = item.typeIntervention || 'Undefined';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort by frequency descending
    let sortedDistribution = Object.entries(distribution)
      .map(([key, value]) => ({ name: key, value: Number(value) }))
      .sort((a, b) => b.value - a.value);

    // Handle 'Others' if there are more than 10 categories
    if (sortedDistribution.length > 10) {
      const others = {
        name: 'Others',
        value: sortedDistribution.slice(10).reduce((acc, curr) => acc + Number(curr.value), 0),
      };
      sortedDistribution = sortedDistribution.slice(0, 10);
      sortedDistribution.push(others);
    }

    return sortedDistribution;
  }, [maintenanceData]);

  // Render Site Nature Analysis as a Stacked Bar Chart
  const renderSiteNatureAnalysis = () => {
    const { data, natureTypes } = analyzeSiteMaintenanceNature();

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ChartWrapper title="Maintenance Intervention Nature Analysis by Site (%)">
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={data}
                margin={{
                  top: 20, right: 30, left: 20, bottom: 100,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="site" 
                  interval={0} 
                  angle={-45} 
                  textAnchor="end" 
                  height={100} 
                />
                <YAxis 
                  label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                />
                <RechartsTooltip formatter={(value) => `${value}%`} />
                <Legend verticalAlign="top" height={36}/> {/* Retain Legend if needed */}
                {natureTypes.map((nature, index) => (
                  <Bar 
                    key={nature} 
                    dataKey={nature} 
                    stackId="a" 
                    fill={COLORS[index % COLORS.length]} 
                    name={nature}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Grid>
      </Grid>
    );
  };

  // Render Inventory Distribution Pie Chart (Top 10)
  const renderInventoryDistribution = () => (
    <Grid item xs={12} md={6}>
      <ChartWrapper title="Inventory Distribution by Type (Top 10)">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={inventoryDistribution}
              dataKey="value"
              nameKey="name"
              cx="40%" // Shifted to the left to make space for the legend on the right
              cy="50%"
              outerRadius={100}
              labelLine={false} // Removes the connecting lines
              // Removed the label prop to eliminate labels on slices
            >
              {inventoryDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} /> {/* Use CustomTooltip */}
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              wrapperStyle={{ lineHeight: '24px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </Grid>
  );

  // Render Maintenance Type Distribution Pie Chart (Top 10)
  const renderMaintenanceTypeDistribution = () => (
    <Grid item xs={12} md={6}>
      <ChartWrapper title="Maintenance Type Distribution (Top 10)">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={maintenanceTypeDistribution}
              dataKey="value"
              nameKey="name"
              cx="40%" // Shifted to the left to make space for the legend on the right
              cy="50%"
              outerRadius={100}
              labelLine={false} // Removes the connecting lines
              // Removed the label prop to eliminate labels on slices
            >
              {maintenanceTypeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} /> {/* Use CustomTooltip */}
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              wrapperStyle={{ lineHeight: '24px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </Grid>
  );

  // --- Event Handlers ---
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // --- Generate Report Function ---
  const generateReport = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Top 10 Inventory by Quantity
      const invQtySheet = XLSX.utils.json_to_sheet(top10InventoryQuantity);
      XLSX.utils.book_append_sheet(workbook, invQtySheet, 'Top10_Inv_Quantity');

      // Top 10 Inventory by Total Value
      const invValSheet = XLSX.utils.json_to_sheet(top10InventoryValue);
      XLSX.utils.book_append_sheet(workbook, invValSheet, 'Top10_Inv_Value');

      // Top 10 Maintenance Frequency
      const maintFreqSheet = XLSX.utils.json_to_sheet(top10MaintenanceFrequency);
      XLSX.utils.book_append_sheet(workbook, maintFreqSheet, 'Top10_Maint_Freq');

      // Top 10 Maintenance Cost
      const maintCostSheet = XLSX.utils.json_to_sheet(top10MaintenanceCost);
      XLSX.utils.book_append_sheet(workbook, maintCostSheet, 'Top10_Maint_Cost');

      // Site Nature Analysis
      const { data: siteNatureData, natureTypes } = analyzeSiteMaintenanceNature();
      const siteNatureSheet = XLSX.utils.json_to_sheet(siteNatureData);
      XLSX.utils.book_append_sheet(workbook, siteNatureSheet, 'Site_Nature_Analysis');

      // Inventory Distribution (Top 10)
      const invDistSheet = XLSX.utils.json_to_sheet(inventoryDistribution);
      XLSX.utils.book_append_sheet(workbook, invDistSheet, 'Inventory_Distribution');

      // Maintenance Type Distribution (Top 10)
      const maintTypeDistSheet = XLSX.utils.json_to_sheet(maintenanceTypeDistribution);
      XLSX.utils.book_append_sheet(workbook, maintTypeDistSheet, 'Maintenance_Type_Distribution');

      // Export to Excel
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `Dashboard_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);

      setSnackbar({
        open: true,
        message: 'Report generated successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate report.',
        severity: 'error',
      });
    }
  };

  // Loading State
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="100vh" 
        bgcolor={theme.palette.background.default}
      >
        <CircularProgress color="primary" size={80} />
        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
          Loading SEBN Business Intelligence...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Dashboard Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
      >
        <Typography 
          variant="h4" 
          color="primary" 
          sx={{ fontWeight: 'bold' }}
        >
          SEBN Business Intelligence Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<DownloadIcon />}
          onClick={generateReport}
          aria-label="Generate Excel Report"
        >
          Export Report
        </Button>
      </Box>

      {/* Tabs for Switching Between All Top 10, Inventory Top 10, and Maintenance Top 10 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="dashboard tabs" 
          textColor="primary" 
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Top 10" />
          <Tab label="Inventory Top 10" />
          <Tab label="Maintenance Top 10" />
        </Tabs>
      </Box>

      {/* Conditional Rendering Based on Selected Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Top 10 Inventory by Quantity */}
          <Grid item xs={12} md={6}>
            <ChartWrapper title="Top 10 Inventory Items by Quantity">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10InventoryQuantity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                  />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  {/* Removed Legend */}
                  {/* Removed Labels */}
                  <Bar
                    dataKey="quantity"
                    name="Quantity"
                  >
                    {top10InventoryQuantity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </Grid>

          {/* Top 10 Inventory by Total Value (€) */}
          <Grid item xs={12} md={6}>
            <ChartWrapper title="Top 10 Inventory Items by Total Value (€)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10InventoryValue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                  />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => `€${value.toLocaleString()}`}
                  />
                  {/* Removed Legend */}
                  {/* Removed Labels */}
                  <Bar
                    dataKey="totalValue"
                    name="Total Value (€)"
                  >
                    {top10InventoryValue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </Grid>

          {/* Top 10 Maintenance Interventions by Frequency */}
          <Grid item xs={12} md={6}>
            <ChartWrapper title="Top 10 Maintenance Interventions by Frequency">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10MaintenanceFrequency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="type" 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                  />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  {/* Removed Legend */}
                  {/* Removed Labels */}
                  <Bar
                    dataKey="frequency"
                    name="Frequency"
                  >
                    {top10MaintenanceFrequency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </Grid>

          {/* Top 10 Maintenance Interventions by Cost (€) */}
          <Grid item xs={12} md={6}>
            <ChartWrapper title="Top 10 Maintenance Interventions by Cost (€)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10MaintenanceCost}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="type" 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                  />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => `€${value.toLocaleString()}`}
                  />
                  {/* Removed Legend */}
                  {/* Removed Labels */}
                  <Bar
                    dataKey="totalCost"
                    name="Total Cost (€)"
                  >
                    {top10MaintenanceCost.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </Grid>

          {/* Site Nature Analysis */}
          <Grid item xs={12}>
            {renderSiteNatureAnalysis()}
          </Grid>

          {/* Inventory Distribution Pie Chart (Top 10) */}
          {renderInventoryDistribution()}

          {/* Maintenance Type Distribution Pie Chart (Top 10) */}
          {renderMaintenanceTypeDistribution()}
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Top 10 Inventory by Quantity */}
          <Grid item xs={12} md={6}>
            <ChartWrapper title="Top 10 Inventory Items by Quantity">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10InventoryQuantity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                  />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  {/* Removed Legend */}
                  {/* Removed Labels */}
                  <Bar
                    dataKey="quantity"
                    name="Quantity"
                  >
                    {top10InventoryQuantity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </Grid>

          {/* Top 10 Inventory by Total Value (€) */}
          <Grid item xs={12} md={6}>
            <ChartWrapper title="Top 10 Inventory Items by Total Value (€)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10InventoryValue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                  />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => `€${value.toLocaleString()}`}
                  />
                  {/* Removed Legend */}
                  {/* Removed Labels */}
                  <Bar
                    dataKey="totalValue"
                    name="Total Value (€)"
                  >
                    {top10InventoryValue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </Grid>

          {/* Inventory Distribution Pie Chart (Top 10) */}
          {renderInventoryDistribution()}
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* Top 10 Maintenance Interventions by Frequency */}
          <Grid item xs={12} md={6}>
            <ChartWrapper title="Top 10 Maintenance Interventions by Frequency">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10MaintenanceFrequency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="type" 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                  />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  {/* Removed Legend */}
                  {/* Removed Labels */}
                  <Bar
                    dataKey="frequency"
                    name="Frequency"
                  >
                    {top10MaintenanceFrequency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </Grid>

          {/* Top 10 Maintenance Interventions by Cost (€) */}
          <Grid item xs={12} md={6}>
            <ChartWrapper title="Top 10 Maintenance Interventions by Cost (€)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10MaintenanceCost}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="type" 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                  />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => `€${value.toLocaleString()}`}
                  />
                  {/* Removed Legend */}
                  {/* Removed Labels */}
                  <Bar
                    dataKey="totalCost"
                    name="Total Cost (€)"
                  >
                    {top10MaintenanceCost.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </Grid>

          {/* Maintenance Type Distribution Pie Chart (Top 10) */}
          {renderMaintenanceTypeDistribution()}
        </Grid>
      )}

      {/* Generate Report Button */}
      <Box display="flex" justifyContent="flex-end" mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={generateReport}
          size="large"
          startIcon={<DownloadIcon />}
          aria-label="Generate Excel Report"
        >
          Generate Top 10 Excel Report
        </Button>
      </Box>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;

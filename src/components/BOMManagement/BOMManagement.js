// src/pages/PreventiveMaintenance/admin/BOMManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  MenuItem,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import BadgeIcon from '@mui/icons-material/Badge'; // Ensure this import
import api from '../../api/api'; // Ensure this path is correct

// UnitNamesDialog Component
const UnitNamesDialog = ({ open, onClose, quantity, unitNames, onSave }) => {
  const [names, setNames] = useState(unitNames || Array(quantity).fill(''));

  useEffect(() => {
    if (open) {
      setNames(unitNames || Array(quantity).fill(''));
    }
  }, [open, unitNames, quantity]);

  const handleSave = () => {
    onSave(names);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Assign Unit Names</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {Array.from({ length: quantity }, (_, index) => (
            <TextField
              key={index}
              fullWidth
              label={`Unit ${index + 1}`}
              value={names[index] || ''}
              onChange={(e) => {
                const newNames = [...names];
                newNames[index] = e.target.value;
                setNames(newNames);
              }}
              sx={{ mb: 2 }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const BOMManagement = () => {
  // State variables
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [bom, setBom] = useState(null);
  const [bomLines, setBomLines] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // State for UnitNamesDialog
  const [unitNamesDialog, setUnitNamesDialog] = useState({
    open: false,
    lineIndex: null,
  });

  // Categories for BOM lines
  const categories = [
    'holder 2d',
    'holder 3d',
    'em',
    'screw',
    'khm',
    'accessoire',
    'clipheads',
    'autre',
  ];

  // Fetch initial data on component mount
  useEffect(() => {
    fetchBoards();
    fetchInventoryItems();
  }, []);

  // Function to fetch boards
  const fetchBoards = async () => {
    try {
      const response = await api.get('/boards');
      setBoards(response.data);
      console.log('Fetched boards:', response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
      showSnackbar('Failed to fetch boards', 'error');
    }
  };

  // Function to fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      const response = await api.get('/inventory');
      setInventoryItems(response.data);
      console.log('Fetched inventory items:', response.data);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      showSnackbar('Failed to fetch inventory items', 'error');
    }
  };

  // Function to fetch BOM for a selected board
  const fetchBOM = async (boardId) => {
    setLoading(true);
    try {
      const response = await api.get(`/boms/board/${boardId}`);
      setBom(response.data);
      // Initialize bomLines with unitNames if not present
      const linesWithUnitNames = response.data.bomLines.map((line) => ({
        ...line,
        unitNames: line.unitNames || Array(line.quantity).fill(''),
      }));
      setBomLines(linesWithUnitNames);
      console.log('Fetched BOM:', response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // BOM doesn't exist yet for this board - that's OK
        setBom(null);
        setBomLines([]);
        console.log('No BOM found for Board ID:', boardId);
      } else {
        console.error('Error fetching BOM:', error);
        showSnackbar('Failed to fetch BOM', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle board selection
  const handleBoardSelect = async (board) => {
    setSelectedBoard(board);
    await fetchBOM(board.id);
  };

  // Add a new BOM line
  const addBOMLine = () => {
    const tempId = `temp-${Date.now()}`; // Temporary ID for new line
    setBomLines([
      ...bomLines,
      {
        id: tempId,
        category: '',
        inventoryItemId: '',
        componentName: '',
        unitPrice: 0,
        quantity: 1,
        lineCost: 0,
        unitNames: [''], // Initialize unitNames
      },
    ]);
    console.log('Added new BOM line:', tempId);
  };

  // Update a BOM line
  const updateBOMLine = (index, field, value) => {
    const updatedLines = [...bomLines];
    const line = { ...updatedLines[index] };

    if (field === 'inventoryItemId' && value) {
      const item = inventoryItems.find((i) => i.id === value);
      if (item) {
        line.componentName = item.refCode;
        line.unitPrice = item.price;
        // Update line cost automatically
        line.lineCost = item.price * line.quantity;
        console.log(`Updated BOM line at index ${index} with InventoryItem ID: ${value}`);
      }
    }

    line[field] = value;

    if (field === 'quantity') {
      const newQuantity = parseInt(value, 10);
      line.lineCost = line.unitPrice * newQuantity;

      // Update unit names array when quantity changes
      const currentNames = line.unitNames || [];
      if (newQuantity > currentNames.length) {
        // Add default names for new units
        const newNames = Array(newQuantity - currentNames.length)
          .fill('')
          .map((_, i) => `Unit ${currentNames.length + i + 1}`);
        line.unitNames = [...currentNames, ...newNames];
      } else {
        // Truncate excess names
        line.unitNames = currentNames.slice(0, newQuantity);
      }

      console.log('Updated unit names after quantity change:', {
        quantity: newQuantity,
        unitNames: line.unitNames
      });
    }

    updatedLines[index] = line;
    setBomLines(updatedLines);
    console.log(`Updated BOM line at index ${index}:`, line);
  };

  // Delete a BOM line
  const deleteBOMLine = (index) => {
    const removedLine = bomLines[index];
    setBomLines(bomLines.filter((_, i) => i !== index));
    console.log(`Deleted BOM line at index ${index}:`, removedLine);
  };

  // **Updated Handle Unit Names Save Function**
  const handleUnitNamesSave = (names) => {
    console.log('Saving unit names:', names);
    const updatedLines = [...bomLines];
    const lineIndex = unitNamesDialog.lineIndex;

    if (lineIndex !== null && updatedLines[lineIndex]) {
      const line = updatedLines[lineIndex];
      console.log('Before update - line:', line);

      // Ensure we have the correct number of unit names
      const unitNames = names.length === line.quantity ?
        names :
        [...names, ...Array(line.quantity - names.length).fill('')].slice(0, line.quantity);

      console.log('Processed unit names:', unitNames);
      updatedLines[lineIndex] = {
        ...line,
        unitNames: unitNames
      };

      console.log('After update - line:', updatedLines[lineIndex]);
      setBomLines(updatedLines);
      showSnackbar('Unit names updated successfully', 'success');
    }
  };

  // **Updated Save BOM Function**
  const saveBOM = async () => {
    if (!selectedBoard) {
      showSnackbar('Please select a board first', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payloadLines = bomLines.map(line => {
        // Ensure we have unit names for each unit
        const unitNames = line.unitNames?.length === line.quantity ?
          line.unitNames :
          [...line.unitNames, ...Array(line.quantity - line.unitNames.length).fill('')].slice(0, line.quantity);

        console.log('Processing line for save:', {
          componentName: line.componentName,
          quantity: line.quantity,
          unitNames
        });

        return {
          ...line,
          lineCost: line.unitPrice * line.quantity,
          unitNames
        };
      });

      console.log('Final payload lines:', payloadLines);

      let response;
      if (bom) {
        console.log('Updating existing BOM:', bom.id);
        response = await api.post(`/boms/${bom.id}/lines`, payloadLines);
      } else {
        console.log('Creating new BOM for board:', selectedBoard.id);
        response = await api.post(`/boms/board/${selectedBoard.id}`, {
          boardId: selectedBoard.id,
          bomLines: payloadLines,
          totalCost: bomLines.reduce((sum, line) => sum + (line.unitPrice * line.quantity), 0),
        });
      }

      console.log('Save response:', response.data);
      showSnackbar('BOM saved successfully', 'success');

      // Fetch updated data
      await fetchBOM(selectedBoard.id);
    } catch (error) {
      console.error('Error saving BOM:', error);
      console.error('Error details:', error.response?.data);
      showSnackbar('Failed to save BOM', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Function to show snackbar notifications
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle Snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate total cost of BOM lines
  const totalCost = bomLines.reduce((sum, line) => sum + (line.unitPrice * line.quantity), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        BOM Management
      </Typography>

      {/* Board Selection Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select Board
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}>Board ID</TableCell>
                <TableCell sx={{ color: 'white' }}>FB Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {boards.length > 0 ? (
                boards.map((board) => (
                  <TableRow
                    key={board.id}
                    selected={selectedBoard?.id === board.id}
                    hover
                  >
                    <TableCell>{board.id}</TableCell>
                    <TableCell>{board.fbName}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleBoardSelect(board)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No boards available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* BOM Lines Section */}
      {selectedBoard && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              BOM Lines for {selectedBoard.fbName}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addBOMLine}
            >
              Add Line
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white' }}>Category</TableCell>
                  <TableCell sx={{ color: 'white' }}>Component</TableCell>
                  <TableCell sx={{ color: 'white' }}>Unit Price (€)</TableCell>
                  <TableCell sx={{ color: 'white' }}>Quantity</TableCell>
                  <TableCell sx={{ color: 'white' }}>Line Cost (€)</TableCell>
                  <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bomLines.length > 0 ? (
                  bomLines.map((line, index) => (
                    <TableRow key={line.id}>
                      {/* Category */}
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={line.category}
                          onChange={(e) =>
                            updateBOMLine(index, 'category', e.target.value)
                          }
                        >
                          {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>

                      {/* Component */}
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={line.inventoryItemId || ''}
                          onChange={(e) =>
                            updateBOMLine(index, 'inventoryItemId', e.target.value)
                          }
                        >
                          <MenuItem value="">
                            <em>Select Component</em>
                          </MenuItem>
                          {inventoryItems.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.refCode} - {item.price}€
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>

                      {/* Unit Price */}
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={line.unitPrice}
                          onChange={(e) =>
                            updateBOMLine(index, 'unitPrice', parseFloat(e.target.value))
                          }
                          inputProps={{ min: 0, step: '0.01' }}
                        />
                      </TableCell>

                      {/* Quantity */}
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={line.quantity}
                          onChange={(e) =>
                            updateBOMLine(index, 'quantity', parseInt(e.target.value, 10))
                          }
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>

                      {/* Line Cost */}
                      <TableCell>
                        {line.lineCost ? line.lineCost.toFixed(2) : '0.00'}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        {/* Assign Unit Names Button */}
                        <Tooltip title="Assign Unit Names">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              setUnitNamesDialog({
                                open: true,
                                lineIndex: index,
                              })
                            }
                          >
                            <BadgeIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Delete Line Button */}
                        <Tooltip title="Delete Line">
                          <IconButton
                            color="error"
                            onClick={() => deleteBOMLine(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No BOM lines available.
                    </TableCell>
                  </TableRow>
                )}

                {/* Total Cost Row */}
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total Cost:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {totalCost.toFixed(2)} €
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Save BOM Button */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveBOM}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save BOM'}
            </Button>
          </Box>
        </Box>
      )}

      {/* UnitNamesDialog Component */}
      <UnitNamesDialog
        open={unitNamesDialog.open}
        onClose={() => setUnitNamesDialog({ open: false, lineIndex: null })}
        quantity={
          unitNamesDialog.lineIndex !== null
            ? bomLines[unitNamesDialog.lineIndex]?.quantity || 0
            : 0
        }
        unitNames={
          unitNamesDialog.lineIndex !== null
            ? bomLines[unitNamesDialog.lineIndex]?.unitNames || []
            : []
        }
        onSave={handleUnitNamesSave}
      />

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BOMManagement;

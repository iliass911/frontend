import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import api from '../../api/api';

const InventoryForm = () => {
  const [formData, setFormData] = useState({
    refCode: '',
    site: '',
    type: '',
    quantity: '',
    place: '',
    unit: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sites, setSites] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch sites
        const sitesResponse = await api.get('/sites');
        setSites(sitesResponse.data);

        // If editing, fetch item data
        if (isEdit) {
          const itemResponse = await api.get(`/inventory/${id}`);
          setFormData({
            refCode: itemResponse.data.refCode,
            site: itemResponse.data.site,
            type: itemResponse.data.type || '',
            quantity: itemResponse.data.quantity || '',
            place: itemResponse.data.place || '',
            unit: itemResponse.data.unit || '',
            price: itemResponse.data.price || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch necessary data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
      };
      if (isEdit) {
        await api.put(`/inventory/${id}`, payload);
        alert('Item updated successfully.');
      } else {
        await api.post('/inventory', payload);
        alert('Item created successfully.');
      }
      navigate('/inventory');
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save the inventory item.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Inventory Item' : 'Add New Inventory Item'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Ref Code"
              name="refCode"
              value={formData.refCode}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="site-label">Site</InputLabel>
              <Select
                labelId="site-label"
                label="Site"
                name="site"
                value={formData.site}
                onChange={handleChange}
              >
                {sites.map((site) => (
                  <MenuItem key={site.id} value={site.name}>
                    {site.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Rest of your form fields remain the same */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="number"
              label="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Place"
              name="place"
              value={formData.place}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="number"
              label="Price (€)"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InventoryForm;
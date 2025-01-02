// src/components/maintenance/MaintenanceForm.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import api from '../../api/api';

// Define the intervention types and their corresponding values
const INTERVENTION_TYPES = [
  { label: 'KHM (Photo cellule/Sensor EH01-V4_60)', value: 'KHM (Photo cellule/Sensor EH01-V4_60)', euro: 7.74 },
  { label: 'KHM (Charboune/Power Supply Sliders KHM-SLI03)', value: 'KHM (Charboune/Power Supply Sliders KHM-SLI03)', euro: 12.46 },
  { label: 'KHM (Carte Muster/DC-08A02)', value: 'KHM (Carte Muster/DC-08A02)', euro: 58.71 },
  { label: 'KHM (Carte Slave/DC-05P05)', value: 'KHM (Carte Slave/DC-05P05)', euro: 46.25 },
  { label: 'KHM (Carte de communication/DC-08C02)', value: 'KHM (Carte de communication/DC-08C02)', euro: 22.53 },
  { label: 'KHM (Transformateur/Power Supply 230VAC/12VDC/5A)', value: 'KHM (Transformateur/Power Supply 230VAC/12VDC/5A)', euro: 3.2 },
  { label: 'KHM (Raille/Power Supply Sliders KHM-SLI03)', value: 'KHM (Raille/Power Supply Sliders KHM-SLI03)', euro: 18.49 },
  { label: 'KHM (RG9)', value: 'KHM (RG9)', euro: 0.04 },
  { label: 'Element Metalique (support/clip Jig FD KHM)', value: 'Element Metalique (support/clip Jig FD KHM)', euro: 5 },
  { label: 'Element Metalique (Tige/Jig FD 110/80/06 )', value: 'Element Metalique (Tige/Jig FD 110/80/06 )', euro: 4.34 },
  { label: 'Element Metalique (Jig B/support CP M  )', value: 'Element Metalique (Jig B/support CP M  )', euro: 4.34 },
  { label: 'Element Metalique (Jig steel /support CP F  )', value: 'Element Metalique (Jig steel /support CP F  )', euro: 2.53 },
  { label: 'Element Metalique (Ressort /Jig  Flex 130 )', value: 'Element Metalique (Ressort /Jig  Flex 130 )', euro: 1.46 },
  { label: 'Element Metalique ( Masse/Jig ground 5 mm )', value: 'Element Metalique ( Masse/Jig ground 5 mm )', euro: 2 },
  { label: 'Element Metalique ( Special Jig )', value: 'Element Metalique ( Special Jig )', euro: 5.36 },
  { label: 'Element Metalique (Passe fils/Expender)', value: 'Element Metalique (Passe fils/Expender)', euro: 18 },
  { label: 'Holder (Point soudage/Jig Splice holder)', value: 'Holder (Point soudage/Jig Splice holder)', euro: 3.5 },
  { label: 'Holder (Contre piéce)', value: 'Holder (Contre piéce)', euro: 10.5 },
  { label: 'Holder (Pince crocodille ( Jig FIX W_Holder_50mm)', value: 'Holder (Pince crocodille ( Jig FIX W_Holder_50mm)', euro: 3.5 },
  { label: 'Accesoire Holder (stopper 35mm)', value: 'Accesoire Holder (stopper 35mm)', euro: 3.03 },
  { label: 'Accesoire Holder (stopper 40mm)', value: 'Accesoire Holder (stopper 40mm)', euro: 3.03 },
  { label: 'Accesoire Holder(stopper 45mm)', value: 'Accesoire Holder(stopper 45mm)', euro: 3.06 },
  { label: 'Accesoire Holder (stopper 55mm)', value: 'Accesoire Holder (stopper 55mm)', euro: 4 },
  { label: 'Accesoire Holder (stopper 65mm)', value: 'Accesoire Holder (stopper 65mm)', euro: 4 },
  { label: 'Accesoire Holder(stopper 70mm)', value: 'Accesoire Holder(stopper 70mm)', euro: 4 },
  { label: 'Accesoire Holder (Guidage/Hosing core guidance PA)', value: 'Accesoire Holder (Guidage/Hosing core guidance PA)', euro: 7 },
  { label: 'Accesoire Holder (Switch/D2F221 (SW4EH01)', value: 'Accesoire Holder (Switch/D2F221 (SW4EH01)', euro: 1.05 },
  { label: 'Autre', value: 'Autre', euro: 0 },
];

// Define the nature intervention options
const NATURE_INTERVENTION_OPTIONS = [
  'Predictive',
  'Reglage',
  'Remplacement',
  'Reparation',
  'Revision',
];

// Define the shift options
const SHIFT_OPTIONS = ['A', 'B', 'C'];

const MaintenanceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Get auth state from Redux
  const authState = useSelector((state) => state.auth);
  console.log('Auth State:', authState);

  // Extract token from auth state
  const token = authState?.token;
  console.log('Token:', token);

  // Decode token to get username
  const getUsername = () => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Decoded Token:', decodedToken);
        return decodedToken.sub || decodedToken.username || '';
      } catch (error) {
        console.error('Error decoding token:', error);
        return '';
      }
    }
    return '';
  };

  const username = getUsername();
  console.log('Extracted Username:', username);

  // Initialize formData with username
  const [formData, setFormData] = useState({
    typeIntervention: '',
    valeurEuro: '',
    pointExaminer: '',
    natureIntervention: '',
    posteTouche: '',
    zone: '',
    shift: '',
    numeroPanneau: '',
    nomPrenomBB: username, // Set initial value here
    tempsIntervention: '',
    date: null,
    commentaire: '',
    site: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sites, setSites] = useState([]);

  // Update nomPrenomBB whenever username changes
  useEffect(() => {
    if (username) {
      setFormData((prev) => ({
        ...prev,
        nomPrenomBB: username,
      }));
    }
  }, [username]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch sites
        const sitesResponse = await api.get('/sites');
        setSites(sitesResponse.data);

        // If editing, fetch intervention data
        if (isEdit) {
          const interventionResponse = await api.get(`/maintenance/${id}`);
          const data = interventionResponse.data;
          const interventionType = data.typeIntervention;
          const matchedType = INTERVENTION_TYPES.find(
            (type) => type.label === interventionType
          );

          setFormData((prev) => ({
            ...prev,
            typeIntervention: interventionType || '',
            valeurEuro: matchedType ? matchedType.euro : 0,
            pointExaminer: data.pointExaminer || '',
            natureIntervention: data.natureIntervention || '',
            posteTouche: data.posteTouche || '',
            zone: data.zone || '',
            shift: data.shift || '',
            numeroPanneau: data.numeroPanneau || '',
            nomPrenomBB: username, // Ensure username is set even when editing
            tempsIntervention: data.tempsIntervention || '',
            date: data.date ? new Date(data.date) : null,
            commentaire: data.commentaire || '',
            site: data.site || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch necessary data.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEdit, username]);

  // Handler for Type d'Intervention changes
  const handleTypeInterventionChange = (event, newValue) => {
    const matchedType = INTERVENTION_TYPES.find(
      (type) => type.label === newValue
    );
    setFormData((prev) => ({
      ...prev,
      typeIntervention: newValue,
      valeurEuro: matchedType ? matchedType.euro : 0, // Set to 0 for custom types
    }));
  };

  // Handler for Nature d'Intervention changes
  const handleNatureInterventionChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      natureIntervention: newValue,
    }));
  };

  // Handler for other input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for Date changes
  const handleDateChange = (newDate) => {
    setFormData((prev) => ({ ...prev, date: newDate }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        valeurEuro: Number(formData.valeurEuro),
        tempsIntervention: Number(formData.tempsIntervention),
        date: formData.date ? formData.date.toISOString().split('T')[0] : null,
      };
      if (isEdit) {
        await api.put(`/maintenance/${id}`, payload);
        alert('Intervention updated successfully.');
      } else {
        await api.post('/maintenance', payload);
        alert('Intervention created successfully.');
      }
      navigate('/maintenance');
    } catch (error) {
      console.error('Error saving intervention:', error);
      alert('Failed to save the maintenance intervention.');
    } finally {
      setSaving(false);
    }
  };

  // SiteSelector Component
  const SiteSelector = () => (
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth required>
        <InputLabel id="site-select-label">Site</InputLabel>
        <Select
          labelId="site-select-label"
          id="site-select"
          name="site"
          value={formData.site}
          label="Site"
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
  );

  // ShiftSelector Component (Moved inside MaintenanceForm)
  const ShiftSelector = () => (
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth required>
        <InputLabel id="shift-select-label">Shift</InputLabel>
        <Select
          labelId="shift-select-label"
          id="shift-select"
          name="shift"
          value={formData.shift}
          label="Shift"
          onChange={handleChange}
        >
          {SHIFT_OPTIONS.map((shift) => (
            <MenuItem key={shift} value={shift}>
              {shift}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select the shift (A, B, or C)</FormHelperText>
      </FormControl>
    </Grid>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Maintenance Intervention' : 'Add New Maintenance Intervention'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Type d'Intervention Field */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              options={INTERVENTION_TYPES.map((type) => type.label)}
              value={formData.typeIntervention}
              onChange={handleTypeInterventionChange}
              onInputChange={(event, newInputValue) => {
                handleTypeInterventionChange(event, newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Type d'Intervention"
                  required
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Valeur (€) Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="number"
              label="Valeur (€)"
              name="valeurEuro"
              value={formData.valeurEuro}
              InputProps={{
                readOnly: true, // Makes the field read-only
              }}
            />
          </Grid>

          {/* Nature d'Intervention Field */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              freeSolo
              options={NATURE_INTERVENTION_OPTIONS}
              value={formData.natureIntervention}
              onChange={handleNatureInterventionChange}
              onInputChange={(event, newInputValue) => {
                handleNatureInterventionChange(event, newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nature d'Intervention"
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Point à Examiner Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Point à Examiner"
              name="pointExaminer"
              value={formData.pointExaminer}
              onChange={handleChange}
            />
          </Grid>

          {/* Poste Touché Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Poste Touché"
              name="posteTouche"
              value={formData.posteTouche}
              onChange={handleChange}
            />
          </Grid>

          {/* Zone Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Zone"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
            />
          </Grid>

          {/* Shift Field */}
          <ShiftSelector />

          {/* N° de Panneau Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="N° de Panneau"
              name="numeroPanneau"
              value={formData.numeroPanneau}
              onChange={handleChange}
            />
          </Grid>

          {/* Nom & Prénom BB Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nom & Prénom BB"
              name="nomPrenomBB"
              value={formData.nomPrenomBB || ''}
              InputProps={{
                readOnly: true, // Makes the field read-only
              }}
              disabled // Greys out the field to indicate it's not editable
            />
          </Grid>

          {/* Temps d'Intervention Field */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              type="number"
              label="Temps d'Intervention (heures)"
              name="tempsIntervention"
              value={formData.tempsIntervention}
              onChange={handleChange}
            />
          </Grid>

          {/* Date Field */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date"
              value={formData.date}
              onChange={handleDateChange}
              renderInput={(params) => <TextField required fullWidth {...params} />}
            />
          </Grid>

          {/* Commentaire Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Commentaire"
              name="commentaire"
              value={formData.commentaire}
              onChange={handleChange}
            />
          </Grid>

          {/* Site Selector */}
          <SiteSelector />
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

export default MaintenanceForm;

// src/components/common/ReusableModal.js

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';

const ReusableModal = ({
  open,
  handleClose,
  title,
  formFields,
  handleChange,
  handleSubmit,
  submitLabel,
  submitting,
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box
          component="form"
          sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
          noValidate
          autoComplete="off"
        >
          {formFields.map((field) => {
            if (field.type === 'select') {
              return (
                <FormControl
                  key={field.name}
                  fullWidth
                  required={field.required}
                  error={field.error}
                >
                  <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
                  <Select
                    labelId={`${field.name}-label`}
                    id={`${field.name}-select`}
                    name={field.name}
                    value={field.value}
                    label={field.label}
                    onChange={handleChange}
                  >
                    {field.options && field.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.display}
                      </MenuItem>
                    ))}
                  </Select>
                  {field.helperText && (
                    <Typography variant="caption" color="error">
                      {field.helperText}
                    </Typography>
                  )}
                </FormControl>
              );
            } else if (field.type !== 'checkbox') {
              return (
                <TextField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  value={field.value}
                  onChange={handleChange}
                  required={field.required}
                  error={field.error}
                  helperText={field.helperText}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              );
            } else {
              return (
                <FormControlLabel
                  key={field.name}
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={handleChange}
                      name={field.name}
                    />
                  }
                  label={field.label}
                />
              );
            }
          })}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ReusableModal;

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

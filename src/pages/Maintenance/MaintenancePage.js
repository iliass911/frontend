// src/pages/Maintenance/MaintenancePage.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MaintenanceList from '../../components/maintenance/MaintenanceList';
import MaintenanceForm from '../../components/maintenance/MaintenanceForm';

const MaintenancePage = () => {
  return (
    <Routes>
      <Route path="/" element={<MaintenanceList />} />
      <Route path="add" element={<MaintenanceForm />} />
      <Route path="edit/:id" element={<MaintenanceForm />} />
    </Routes>
  );
};

export default MaintenancePage;

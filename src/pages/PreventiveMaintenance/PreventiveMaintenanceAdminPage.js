// src/pages/PreventiveMaintenance/PreventiveMaintenanceAdminPage.js

import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import SitesManagement from './admin/SitesManagement';
import ProjectsManagement from './admin/ProjectsManagement';
import PacksManagement from './admin/PacksManagement';
import BoardsManagement from './admin/BoardsManagement';
import MaintenanceSchedulesManagement from './admin/MaintenanceSchedulesManagement';

const PreventiveMaintenanceAdminPage = () => {
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        aria-label="Preventive Maintenance Admin Tabs"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Sites" />
        <Tab label="Projects" />
        <Tab label="Packs" />
        <Tab label="Boards" />
        <Tab label="Maintenance Schedules" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && <SitesManagement />}
        {currentTab === 1 && <ProjectsManagement />}
        {currentTab === 2 && <PacksManagement />}
        {currentTab === 3 && <BoardsManagement />}
        {currentTab === 4 && <MaintenanceSchedulesManagement />}
      </Box>
    </Box>
  );
};

export default PreventiveMaintenanceAdminPage;

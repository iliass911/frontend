// src/AppRoutes.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Import Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import LandingPage from './pages/Landing/LandingPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import InventoryPage from './pages/Inventory/InventoryPage'; // Main Inventory listing
import InventoryForm from './components/inventory/InventoryForm'; // Full create/edit form
import QuantityUpdateForm from './components/inventory/QuantityUpdateForm'; // Quantity-only form
import MaintenancePage from './pages/Maintenance/MaintenancePage';

// Import Preventive Maintenance Pages
import PreventiveMaintenanceAdminPage from './pages/PreventiveMaintenance/PreventiveMaintenanceAdminPage';
import PreventiveMaintenanceUserPage from './pages/PreventiveMaintenance/user/PreventiveMaintenanceUserPage';

// Import Audit Logs Page
import AuditLogsPage from './pages/AuditLogs/AuditLogPage';

// Import Board Inventory Page
import BoardInventoryPage from './pages/Boards/BoardInventoryPage';

// Import BOM Management Page
import BOMManagement from './components/BOMManagement/BOMManagement';

// Import Settings Page
import Settings from './pages/Settings/Settings'; // <-- Import Settings

// Import Route Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';

// Import Layout
import Layout from './components/common/Layout';

const AppRoutes = () => {
  const role = useSelector((state) => state.auth.role);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/landing"
          element={
            <ProtectedRoute>
              <Layout>
                <LandingPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin-Only Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute requiredRoles={['ADMIN']}>
                <Layout>
                  <DashboardPage />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/*
          INVENTORY ROUTES
          We nest our inventory sub-routes (list, add, edit, update-quantity)
          under a single parent path="/inventory/*".
        */}
        <Route
          path="/inventory/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Default listing of inventory items */}
                  <Route index element={<InventoryPage />} />

                  {/* Create new inventory item (admin route in InventoryForm) */}
                  <Route path="add" element={<InventoryForm />} />

                  {/* Full edit of an inventory item (admin route in InventoryForm) */}
                  <Route path="edit/:id" element={<InventoryForm />} />

                  {/* Quantity-only update form (for non-admin or admin) */}
                  <Route path="update-quantity/:id" element={<QuantityUpdateForm />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Maintenance */}
        <Route
          path="/maintenance/*"
          element={
            <ProtectedRoute>
              <Layout>
                <MaintenancePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Preventive Maintenance (Admin) */}
        <Route
          path="/preventive-maintenance/admin"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute requiredRoles={['ADMIN']}>
                <Layout>
                  <PreventiveMaintenanceAdminPage />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* Preventive Maintenance (User) */}
        <Route
          path="/preventive-maintenance/user"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute requiredRoles={['USER', 'ADMIN']}>
                <Layout>
                  <PreventiveMaintenanceUserPage />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* Audit Logs (Admin Only) */}
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute requiredRoles={['ADMIN']}>
                <Layout>
                  <AuditLogsPage />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* Board Inventory (Admin Only) */}
        <Route
          path="/boards"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute requiredRoles={['ADMIN']}>
                <Layout>
                  <BoardInventoryPage />
                </Layout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* BOM Management */}
        <Route
          path="/bom-management"
          element={
            <ProtectedRoute>
              <Layout>
                <BOMManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* **New Settings Route** */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

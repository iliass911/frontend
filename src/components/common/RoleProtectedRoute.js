// src/components/common/RoleProtectedRoute.js

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

const RoleProtectedRoute = ({ children, requiredRoles }) => {
    const { role, token } = useSelector((state) => state.auth);
    const [open, setOpen] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        console.log('RoleProtectedRoute - Token:', token);
        console.log('RoleProtectedRoute - User Role:', role);
        console.log('RoleProtectedRoute - Required Roles:', requiredRoles);
        
        if (token && requiredRoles) {
            const hasRole = requiredRoles.includes(role);
            console.log('RoleProtectedRoute - Has Required Role:', hasRole);

            if (!hasRole) {
                setOpen(true);
                setShouldRedirect(true);
            }
        }
    }, [role, requiredRoles, token]);

    const handleClose = () => {
        setOpen(false);
    };

    if (shouldRedirect) {
        return (
            <>
                <Snackbar
                    open={open}
                    autoHideDuration={6000}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                        You do not have permission to access this page.
                    </Alert>
                </Snackbar>
                <Navigate to="/landing" replace />
            </>
        );
    }

    return children;
};

export default RoleProtectedRoute;

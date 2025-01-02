import React from 'react'; 
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
    const { token } = useSelector(state => state.auth);
    const location = useLocation();

    if (!token) {
        console.log('No token found, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;

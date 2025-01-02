import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import InventoryList from '../../components/inventory/InventoryList';
import InventoryForm from '../../components/inventory/InventoryForm';

const InventoryPage = () => {
  // This will allow you to access the route parameters if needed
  const { id } = useParams(); // Use this if you need to access the id parameter in this component

  return (
    <Routes>
      {/* Default listing of inventory items */}
      <Route path="/" element={<InventoryList />} />

      {/* Route for adding a new inventory item */}
      <Route path="add" element={<InventoryForm />} />

      {/* Route for editing an existing inventory item */}
      <Route path="edit/:id" element={<InventoryForm />} />
    </Routes>
  );
};

export default InventoryPage;

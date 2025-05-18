import React from 'react';

const AdminProtectedRoute = ({ children }) => (
  <div data-testid="admin-protected-route">
    {children}
  </div>
);

export default AdminProtectedRoute; 
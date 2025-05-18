import React from 'react';

const PrivateRoute = ({ children }) => (
  <div data-testid="private-route">
    {children}
  </div>
);

export default PrivateRoute; 
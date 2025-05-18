import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Drawer from '../Drawer';
import { mockNavigate } from '../../../setupTests';

// Mock the useLanguage hook
jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key
  })
}));

// Mock the useTheme hook
jest.mock('../../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    darkMode: false
  })
}));

// Mock MUI components
jest.mock('@mui/material', () => {
  const original = jest.requireActual('@mui/material');
  return {
    ...original,
    IconButton: ({ children, onClick, ...props }) => (
      <button onClick={onClick} {...props} role="button">
        {children}
      </button>
    ),
    List: ({ children, ...props }) => (
      <div {...props} role="list">
        {children}
      </div>
    ),
    ListItem: ({ children, onClick, ...props }) => (
      <div onClick={onClick} {...props} role="listitem">
        {children}
      </div>
    ),
    ListItemIcon: ({ children, ...props }) => (
      <div {...props} role="presentation">
        {children}
      </div>
    ),
    ListItemText: ({ children, ...props }) => (
      <div {...props} role="text">
        {children}
      </div>
    ),
    Divider: () => <hr role="separator" />,
    Box: ({ children, ...props }) => (
      <div {...props}>
        {children}
      </div>
    )
  };
});

describe('Drawer Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders without crashing', () => {
    render(<Drawer />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('renders navigation items', () => {
    render(<Drawer />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(8); // Adjust based on your actual number of items
  });

  test('navigates when clicking on a navigation item', () => {
    render(<Drawer />);
    const firstNavItem = screen.getAllByRole('listitem')[0];
    fireEvent.click(firstNavItem);
    expect(mockNavigate).toHaveBeenCalled();
  });

  test('renders dividers between sections', () => {
    render(<Drawer />);
    expect(screen.getAllByRole('separator')).toHaveLength(2); // Adjust based on your actual number of dividers
  });
}); 
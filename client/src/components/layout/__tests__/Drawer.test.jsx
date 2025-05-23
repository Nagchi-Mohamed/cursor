import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Drawer from '../Drawer';
import { LanguageProvider } from '../../../contexts/LanguageContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Drawer Component', () => {
  test('renders drawer navigation', () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <Drawer />
        </MemoryRouter>
      </LanguageProvider>
    );
    
    // Check for the drawer container
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  test('renders navigation sections', () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <Drawer />
        </MemoryRouter>
      </LanguageProvider>
    );
    
    // Test main menu
    const mainMenu = screen.getByRole('list', { name: 'nav.mainMenu' });
    expect(mainMenu).toBeInTheDocument();
    
    // Test utilities menu
    const utilitiesMenu = screen.getByRole('list', { name: 'nav.utilities' });
    expect(utilitiesMenu).toBeInTheDocument();
  });

  test('renders all navigation items', () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <Drawer />
        </MemoryRouter>
      </LanguageProvider>
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
  });

  test('navigates when clicking on a navigation item', () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    
    render(
      <LanguageProvider>
        <MemoryRouter>
          <Drawer />
        </MemoryRouter>
      </LanguageProvider>
    );
    
    const firstNavButton = screen.getAllByRole('button')[0];
    fireEvent.click(firstNavButton);
    
    expect(mockNavigate).toHaveBeenCalled();
  });

  test('renders dividers between sections', () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <Drawer />
        </MemoryRouter>
      </LanguageProvider>
    );
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });
});

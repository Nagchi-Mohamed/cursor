import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import SolverPage from '../SolverPage';
import * as solverService from '../../services/SolverService';
import * as historyService from '../../services/HistoryService';

// Mock services with TypeScript-like typing via JSDoc
/**
 * @type {jest.Mocked<typeof solverService>}
 */
jest.mock('../../services/SolverService', () => ({
  solveProblem: jest.fn(),
  processImage: jest.fn(),
  processVoiceInput: jest.fn(),
}));

/**
 * @type {jest.Mocked<typeof historyService>}
 */
jest.mock('../../services/HistoryService', () => ({
  getHistory: jest.fn(),
}));

// Mock contexts with realistic defaults
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { name: 'Test User', id: 'user-123' },
    logout: jest.fn(),
    token: 'mock-token'
  })
}));

jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
    language: 'en',
    setLanguage: jest.fn()
  })
}));

describe('SolverPage Component', () => {
  const user = userEvent.setup();
  let originalConsoleError;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = jest.fn(); // Suppress React error logs
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    solverService.solveProblem.mockResolvedValue({ solution: '42' });
    historyService.getHistory.mockResolvedValue({ history: [] });
  });

  describe('Core Functionality', () => {
    it('renders all critical UI elements', () => {
      render(<SolverPage />);
      
      expect(screen.getByRole('heading', { name: /solver\.title/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/solver\.inputLabel/i)).toBeInTheDocument();
      expect(screen.getByTestId('solve-button')).toBeInTheDocument();
      expect(screen.getByTestId('image-upload-button')).toBeInTheDocument();
      expect(screen.getByTestId('record-button')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /actions\.toggleHistory/i })).toBeInTheDocument();
    });

    it('solves text input problems and displays solution', async () => {
      render(<SolverPage />);
      const input = screen.getByLabelText(/solver\.inputLabel/i);
      const button = screen.getByTestId('solve-button');

      await user.type(input, 'What is 6 × 7?');
      await user.click(button);

      await waitFor(() => {
        expect(solverService.solveProblem).toHaveBeenCalledWith(
          { input: 'What is 6 × 7?', inputType: 'text' },
          'mock-token'
        );
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByTestId('solution-display')).toBeInTheDocument();
      });
    });

    it('disables solve button when input is empty', () => {
      render(<SolverPage />);
      expect(screen.getByTestId('solve-button')).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('shows error when problem solving fails', async () => {
      solverService.solveProblem.mockRejectedValue(new Error('API Error'));
      render(<SolverPage />);

      await user.type(screen.getByLabelText(/solver\.inputLabel/i), 'Fail case');
      await user.click(screen.getByTestId('solve-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-alert')).toBeInTheDocument();
        expect(screen.getByText(/errors\.solvingFailed/i)).toBeInTheDocument();
      });
    });

    it('maintains input after failed submission', async () => {
      solverService.solveProblem.mockRejectedValue(new Error('API Error'));
      render(<SolverPage />);
      const input = screen.getByLabelText(/solver\.inputLabel/i);
      
      await user.type(input, 'Persistent input');
      await user.click(screen.getByTestId('solve-button'));
      
      await waitFor(() => {
        expect(input).toHaveValue('Persistent input');
      });
    });

    it('shows loading state during async operations', async () => {
      solverService.solveProblem.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ solution: '42' }), 500))
      );
      
      render(<SolverPage />);
      await user.type(screen.getByLabelText(/solver\.inputLabel/i), '1+1');
      await user.click(screen.getByTestId('solve-button'));
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });

  describe('Image Processing', () => {
    it('processes image uploads and populates input', async () => {
      const file = new File(['dummy'], 'equation.png', { type: 'image/png' });
      solverService.processImage.mockResolvedValue({ latex: 'x^2 + y^2 = z^2' });
      
      render(<SolverPage />);
      const uploadInput = screen.getByTestId('image-upload-input-hidden');
      
      fireEvent.change(uploadInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(solverService.processImage).toHaveBeenCalledWith(file, 'mock-token');
        expect(screen.getByLabelText(/solver\.inputLabel/i)).toHaveValue('x^2 + y^2 = z^2');
      });
    });

    it('shows error when image processing fails', async () => {
      const file = new File(['dummy'], 'equation.png', { type: 'image/png' });
      solverService.processImage.mockRejectedValue(new Error('Processing failed'));
      
      render(<SolverPage />);
      fireEvent.change(
        screen.getByTestId('image-upload-input-hidden'), 
        { target: { files: [file] } }
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('error-alert')).toBeInTheDocument();
        expect(screen.getByText(/errors\.imageProcessingFailed/i)).toBeInTheDocument();
      });
    });

    it('rejects invalid file types', async () => {
      const file = new File(['dummy'], 'document.pdf', { type: 'application/pdf' });
      
      render(<SolverPage />);
      fireEvent.change(
        screen.getByTestId('image-upload-input-hidden'), 
        { target: { files: [file] } }
      );
      
      await waitFor(() => {
        expect(solverService.processImage).not.toHaveBeenCalled();
        expect(screen.getByText(/errors\.invalidFileType/i)).toBeInTheDocument();
      });
    });
  });

  describe('Voice Processing', () => {
    beforeAll(() => {
      // Mock MediaRecorder API
      global.MediaRecorder = jest.fn().mockImplementation(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        state: 'inactive',
        ondataavailable: null,
        onerror: null
      }));

      global.navigator.mediaDevices = {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{ stop: jest.fn() }]
        })
      };
    });

    it('handles voice recording flow', async () => {
      solverService.processVoiceInput.mockResolvedValue({ text: 'Solve for x' });
      render(<SolverPage />);

      await user.click(screen.getByTestId('record-button')); // Start
      expect(MediaRecorder).toHaveBeenCalled();
      
      await user.click(screen.getByTestId('record-button')); // Stop
      
      await waitFor(() => {
        expect(screen.getByLabelText(/solver\.inputLabel/i)).toHaveValue('Solve for x');
      });
    });

    it('shows error when voice processing fails', async () => {
      solverService.processVoiceInput.mockRejectedValue(new Error('Transcription failed'));
      render(<SolverPage />);

      await user.click(screen.getByTestId('record-button')); // Start
      await user.click(screen.getByTestId('record-button')); // Stop
      
      await waitFor(() => {
        expect(screen.getByTestId('error-alert')).toBeInTheDocument();
        expect(screen.getByText(/errors\.voiceProcessingFailed/i)).toBeInTheDocument();
      });
    });

    it('handles microphone permission denial', async () => {
      global.navigator.mediaDevices.getUserMedia.mockRejectedValue(
        new Error('Permission denied')
      );
      
      render(<SolverPage />);
      await user.click(screen.getByTestId('record-button'));
      
      await waitFor(() => {
        expect(screen.getByText(/errors\.microphoneAccessDenied/i)).toBeInTheDocument();
      });
    });
  });

  describe('History Integration', () => {
    const mockHistory = [
      {
        _id: '1',
        problem: '2+2',
        solution: '4',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        problem: '3×3',
        solution: '9',
        createdAt: new Date().toISOString()
      }
    ];

    it('loads and displays history items', async () => {
      historyService.getHistory.mockResolvedValue({ history: mockHistory });
      render(<SolverPage />);
      
      await user.click(screen.getByRole('button', { name: /actions\.toggleHistory/i }));
      
      await waitFor(() => {
        expect(screen.getByText('2+2')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('3×3')).toBeInTheDocument();
        expect(screen.getByText('9')).toBeInTheDocument();
      });
    });

    it('populates input from history items', async () => {
      historyService.getHistory.mockResolvedValue({ history: mockHistory });
      render(<SolverPage />);
      
      await user.click(screen.getByRole('button', { name: /actions\.toggleHistory/i }));
      await user.click(await screen.findByText('3×3'));
      
      expect(screen.getByLabelText(/solver\.inputLabel/i)).toHaveValue('3×3');
    });

    it('shows error when history loading fails', async () => {
      historyService.getHistory.mockRejectedValue(new Error('Failed to load'));
      render(<SolverPage />);
      
      await user.click(screen.getByRole('button', { name: /actions\.toggleHistory/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-alert')).toBeInTheDocument();
        expect(screen.getByText(/errors\.historyLoadFailed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SolverPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains proper keyboard navigation', async () => {
      render(<SolverPage />);
      
      await user.tab();
      expect(screen.getByLabelText(/solver\.inputLabel/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByTestId('solve-button')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByTestId('image-upload-button')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByTestId('record-button')).toHaveFocus();
    });

    it('provides proper ARIA attributes', () => {
      render(<SolverPage />);
      
      expect(screen.getByRole('heading', { name: /solver\.title/i })).toHaveAttribute('aria-level', '1');
      expect(screen.getByTestId('solve-button')).toHaveAttribute('aria-busy', 'false');
      expect(screen.getByTestId('image-upload-button')).toHaveAttribute('aria-label', 'Upload image');
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely long input', async () => {
      const longInput = 'x'.repeat(1000);
      solverService.solveProblem.mockResolvedValue({ solution: 'Processed' });
      
      render(<SolverPage />);
      await user.type(screen.getByLabelText(/solver\.inputLabel/i), longInput);
      await user.click(screen.getByTestId('solve-button'));
      
      await waitFor(() => {
        expect(solverService.solveProblem).toHaveBeenCalledWith(
          expect.objectContaining({ input: longInput }),
          'mock-token'
        );
      });
    });

    it('handles rapid sequential submissions', async () => {
      solverService.solveProblem.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ solution: '42' }), 200)
      );
      
      render(<SolverPage />);
      await user.type(screen.getByLabelText(/solver\.inputLabel/i), '1+1');
      
      // Rapid clicks
      await user.click(screen.getByTestId('solve-button'));
      await user.click(screen.getByTestId('solve-button'));
      await user.click(screen.getByTestId('solve-button'));
      
      await waitFor(() => {
        expect(solverService.solveProblem).toHaveBeenCalledTimes(1);
      });
    });

    it('handles network disconnection during solve', async () => {
      solverService.solveProblem.mockImplementationOnce(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network Error')), 100)
      ).mockResolvedValueOnce({ solution: '42' });
      
      render(<SolverPage />);
      await user.type(screen.getByLabelText(/solver\.inputLabel/i), '1+1');
      await user.click(screen.getByTestId('solve-button'));
      
      // First attempt fails
      await waitFor(() => {
        expect(screen.getByTestId('error-alert')).toBeInTheDocument();
      });
      
      // Second attempt succeeds
      await user.click(screen.getByTestId('solve-button'));
      await waitFor(() => {
        expect(screen.getByText('42')).toBeInTheDocument();
      });
    });
  });
});
// IMPORTANT: Axios mock must be at the very top, before any imports,
// to ensure it's applied before any module (including those in test-utils or contexts)
// might import and use axios.
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
};

const mockCreate = jest.fn(() => mockAxiosInstance);
jest.mock('axios', () => ({
  create: mockCreate,
  get: jest.fn(), // General axios.get mock if used directly
  post: jest.fn() // General axios.post mock if used directly
}));

// Mock solverService before importing it
jest.mock('../../services/SolverService', () => ({
  solveProblem: jest.fn(),
  uploadImage: jest.fn(),
  processAudio: jest.fn()
}));

import React from 'react';
// Ensure your custom render is used if SolverPage relies on its providers
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils'; 
import SolverPage from '../SolverPage';
import { mockMediaRecorder } from '../../utils/test-utils'; // Assuming this is correctly set up
import * as solverService from '../../services/SolverService';

// Mock the media recorder
global.MediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);

// Mock translations specific to SolverPage or use a shared translations mock
const solverTestTranslations = {
  'solver.inputPlaceholder': 'Type or paste your math problem here',
  'solver.inputLabel': 'Math Problem',
  'solver.solve': 'Solve',
  'solver.uploadImage': 'Upload Image',
  'solver.startRecording': 'Start Recording',
  'solver.stopRecording': 'Stop Recording',
  'solver.error': 'Error solving problem',
  'solver.loginRequired': 'Please log in to save solutions'
};

// Mock the language context hook
let mockUseLanguageImpl;
jest.mock('../../contexts/LanguageContext', () => ({
  ...jest.requireActual('../../contexts/LanguageContext'), // Keep original exports like Provider if not fully mocking
  useLanguage: () => mockUseLanguageImpl,
}));

// Mock the auth context hook
let mockUseAuthImpl;
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'), // Keep original exports like Provider
  useAuth: () => mockUseAuthImpl,
}));

describe('SolverPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations for hooks
    mockUseLanguageImpl = { // Note: assign the object directly
      language: 'en',
      setLanguage: jest.fn(),
      t: (key) => solverTestTranslations[key] || key
    };

    mockUseAuthImpl = { // Note: assign the object directly
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn()
    };

    // Reset service mocks
    solverService.solveProblem.mockReset();
    solverService.uploadImage.mockReset();
    solverService.processAudio.mockReset();
    
    // Reset axios instance mocks
    mockAxiosInstance.get.mockReset();
    mockAxiosInstance.post.mockReset();
    mockCreate.mockClear(); 
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // Using the customRender from test-utils which should include all necessary providers
  const renderSolverPage = (ui = <SolverPage />, options = {}) => {
    return render(ui, options);
  };

  test('renders solver form with all elements', () => {
    renderSolverPage();

    expect(screen.getByLabelText(solverTestTranslations['solver.inputLabel'])).toBeInTheDocument();
    expect(screen.getByPlaceholderText(solverTestTranslations['solver.inputPlaceholder'])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: solverTestTranslations['solver.solve'] })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: solverTestTranslations['solver.uploadImage'] })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: solverTestTranslations['solver.startRecording'] })).toBeInTheDocument();
  });

  test('shows login required message when not authenticated', () => {
    renderSolverPage();
    expect(screen.getByText(solverTestTranslations['solver.loginRequired'])).toBeInTheDocument();
  });

  test('handles solve button click', async () => {
    solverService.solveProblem.mockResolvedValueOnce({ solution: 'x = 5' });
    renderSolverPage();
    
    const input = screen.getByLabelText(solverTestTranslations['solver.inputLabel']);
    const solveButton = screen.getByRole('button', { name: solverTestTranslations['solver.solve'] });
    
    fireEvent.change(input, { target: { value: '2x + 3 = 13' } });
    fireEvent.click(solveButton);
    
    await waitFor(() => {
      expect(screen.getByText('x = 5')).toBeInTheDocument();
    });
    expect(solverService.solveProblem).toHaveBeenCalledWith('2x + 3 = 13', expect.any(Object));
  });

  test('handles image upload and displays extracted text', async () => {
    const mockExtractedText = '2x + 3 = 7 from image';
    solverService.uploadImage.mockResolvedValueOnce({ text: mockExtractedText });
    renderSolverPage();
    
    const uploadInput = screen.getByTestId('image-upload-input');
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

    fireEvent.change(uploadInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByLabelText(solverTestTranslations['solver.inputLabel'])).toHaveValue(mockExtractedText);
    });
    expect(solverService.uploadImage).toHaveBeenCalledWith(expect.any(FormData));
  });

  test('handles recording functionality and displays transcribed text', async () => {
    const mockTranscribedText = 'solve for x: 2x + 3 = 7 from audio';
    solverService.processAudio.mockResolvedValueOnce({ text: mockTranscribedText });
    
    mockMediaRecorder.start.mockImplementation(() => {
      if (mockMediaRecorder.onstart) mockMediaRecorder.onstart();
    });
    mockMediaRecorder.stop.mockImplementation(() => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
      if (mockMediaRecorder.ondataavailable) {
        mockMediaRecorder.ondataavailable({ data: mockBlob });
      }
      if (mockMediaRecorder.onstop) mockMediaRecorder.onstop();
    });

    renderSolverPage();
    
    const recordButton = screen.getByRole('button', { name: solverTestTranslations['solver.startRecording'] });
    fireEvent.click(recordButton);

    const stopButton = await screen.findByRole('button', { name: solverTestTranslations['solver.stopRecording'] });
    fireEvent.click(stopButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(solverTestTranslations['solver.inputLabel'])).toHaveValue(mockTranscribedText);
    });
    expect(solverService.processAudio).toHaveBeenCalledWith(expect.any(Blob));
  });

  test('displays error message if solving problem fails', async () => {
    solverService.solveProblem.mockRejectedValueOnce(new Error('Network Error'));
    renderSolverPage();

    const input = screen.getByLabelText(solverTestTranslations['solver.inputLabel']);
    const solveButton = screen.getByRole('button', { name: solverTestTranslations['solver.solve'] });
    
    fireEvent.change(input, { target: { value: 'problem' } });
    fireEvent.click(solveButton);

    await waitFor(() => {
      expect(screen.getByText(solverTestTranslations['solver.error'])).toBeInTheDocument();
    });
  });
});

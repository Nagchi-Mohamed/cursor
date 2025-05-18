import React from 'react';
import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import LessonsPage from '../LessonsPage';

// Mock the lesson service
const mockGetLessons = jest.fn();
jest.mock('../../services/LessonService', () => ({
  getLessons: () => mockGetLessons()
}));

// Mock data
const mockLessons = [
  {
    _id: '1',
    title: 'Introduction to Algebra',
    description: 'Learn the basics of algebra',
    category: 'Algebra',
    difficulty: 'Beginner',
    duration: 30,
    tags: ['algebra', 'basics', 'mathematics']
  },
  {
    _id: '2',
    title: 'Advanced Calculus',
    description: 'Master advanced calculus concepts',
    category: 'Calculus',
    difficulty: 'Advanced',
    duration: 45,
    tags: ['calculus', 'advanced', 'mathematics']
  }
];

// Mock translations
const translations = {
  'common.loading': 'Loading...',
  'lessons.searchPlaceholder': 'Search lessons...',
  'lessons.category': 'Category',
  'lessons.difficulty': 'Difficulty',
  'lessons.allCategories': 'All Categories',
  'lessons.allLevels': 'All Levels',
  'actions.start': 'Start',
  'actions.provideFeedback': 'Provide Feedback',
  'errors.loadLessonsFailed': 'Failed to load lessons',
  'nav.lessons': 'Lessons',
  'lessons.startLesson': 'Start Lesson',
  'lessons.viewDetails': 'View Details',
  'lessons.details': 'Details',
  'lessons.filteredResults': 'Showing {count} results',
  'actions.clearFilters': 'Clear Filters',
  'lessons.noLessonsFound': 'No lessons found'
};

// Mock the language context
const mockUseLanguage = jest.fn();
jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => mockUseLanguage()
}));

// Mock the auth context
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock the feedback modal component
jest.mock('../../components/feedback/FeedbackModal', () => {
  const MockFeedbackModal = ({ open, onClose }) => (
    open ? <div data-testid="feedback-modal">Mock Modal <button onClick={onClose}>Close</button></div> : null
  );
  return MockFeedbackModal;
});

describe('LessonsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUseLanguage.mockReturnValue({
      language: 'en',
      setLanguage: jest.fn(),
      t: (key) => translations[key] || key
    });

    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', role: 'user' },
      isAuthenticated: true
    });

    mockGetLessons.mockReset();
  });

  test('renders loading state initially', async () => {
    // Make getLessons take a moment to resolve
    mockGetLessons.mockImplementationOnce(() => new Promise(() => {}));
    
    render(<LessonsPage />);
    
    // Check for loading indicator
    const progressbars = screen.getAllByRole('progressbar');
    expect(progressbars.length).toBeGreaterThan(0);
  });

  test('renders lessons after loading', async () => {
    mockGetLessons.mockResolvedValueOnce(mockLessons);
    
    render(<LessonsPage />);
    
    // Initially shows loading state
    const progressbars = screen.getAllByRole('progressbar');
    expect(progressbars.length).toBeGreaterThan(0);
    
    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
      expect(screen.getByText('Advanced Calculus')).toBeInTheDocument();
    });
    
    // Loading indicator should be gone
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    
    // Verify lesson cards are rendered
    const startButtons = screen.getAllByRole('button', { name: translations['lessons.startLesson'] });
    expect(startButtons).toHaveLength(2);
  });

  test('navigates to lesson when Start button is clicked', async () => {
    mockGetLessons.mockResolvedValueOnce(mockLessons);
    
    render(<LessonsPage />);
    
    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
    });
    
    // Click the Start button for the first lesson
    const startButton = screen.getAllByRole('button', { name: translations['lessons.startLesson'] })[0];
    fireEvent.click(startButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/lessons/1');
  });

  test('filters lessons based on search input', async () => {
    mockGetLessons.mockResolvedValueOnce(mockLessons);
    
    render(<LessonsPage />);
    
    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
    });
    
    // Type in search input
    const searchInput = screen.getByPlaceholderText(translations['lessons.searchPlaceholder']);
    fireEvent.change(searchInput, { target: { value: 'Algebra' } });
    
    // Check if only Algebra lesson is shown
    await waitFor(() => {
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
      expect(screen.queryByText('Advanced Calculus')).not.toBeInTheDocument();
    });
  });

  test('filters lessons based on category', async () => {
    mockGetLessons.mockResolvedValueOnce(mockLessons);

    render(<LessonsPage />);

    await waitFor(() => {
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
    });

    const categorySelect = screen.getByRole('combobox', { name: translations['lessons.category'] });
    fireEvent.mouseDown(categorySelect);

    const algebraOption = await screen.findByRole('option', { name: 'Algebra' });
    fireEvent.click(algebraOption);

    await waitFor(() => {
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
      expect(screen.queryByText('Advanced Calculus')).not.toBeInTheDocument();
    });
  });

  test('filters lessons based on difficulty', async () => {
    mockGetLessons.mockResolvedValueOnce(mockLessons);

    render(<LessonsPage />);

    await waitFor(() => {
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
    });

    const difficultySelect = screen.getByRole('combobox', { name: translations['lessons.difficulty'] });
    fireEvent.mouseDown(difficultySelect);

    const advancedOption = await screen.findByRole('option', { name: 'Advanced' });
    fireEvent.click(advancedOption);

    await waitFor(() => {
      expect(screen.getByText('Advanced Calculus')).toBeInTheDocument();
      expect(screen.queryByText('Introduction to Algebra')).not.toBeInTheDocument();
    });
  });

  test('clears filters when clear button is clicked', async () => {
    mockGetLessons.mockResolvedValueOnce(mockLessons);
    
    render(<LessonsPage />);
    
    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
    });
    
    // Apply filters
    const searchInput = screen.getByPlaceholderText(translations['lessons.searchPlaceholder']);
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'Algebra' } });
    
    // Wait for filter to apply
    await waitFor(() => {
        expect(screen.queryByText('Advanced Calculus')).not.toBeInTheDocument();
    });

    // Clear filters
    const clearButton = screen.getByRole('button', { name: translations['actions.clearFilters'] });
    fireEvent.click(clearButton);
    
    // Check if all lessons are shown again
    await waitFor(() => {
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
      expect(screen.getByText('Advanced Calculus')).toBeInTheDocument();
    });
  });

  test('handles error state when lesson loading fails', async () => {
    mockGetLessons.mockRejectedValueOnce(new Error('Failed to load lessons'));
    
    render(<LessonsPage />);
    
    await waitFor(() => {
      // Check for the error message, assuming it's displayed using the translation key
      const errorMessages = screen.getAllByText(translations['errors.loadLessonsFailed']);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  test('opens feedback modal when feedback button is clicked', async () => {
    mockGetLessons.mockResolvedValueOnce(mockLessons);
    
    render(<LessonsPage />);
    
    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
    });
    
    // Find and click the feedback button using aria-label
    const feedbackButton = screen.getByRole('button', { name: translations['actions.provideFeedback'] });
    fireEvent.click(feedbackButton);
    
    // Verify modal is opened
    expect(screen.getByTestId('feedback-modal')).toBeInTheDocument();
  });
});

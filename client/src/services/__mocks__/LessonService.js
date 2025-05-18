const mockLessons = [
  {
    _id: '1',
    title: 'Introduction to Algebra',
    description: 'Learn the basics of algebra',
    category: 'Algebra',
    difficulty: 'Beginner',
    duration: 30,
    rating: 4.5,
    imageUrl: '/images/algebra.jpg',
    tags: ['algebra', 'basics', 'equations'],
  },
  {
    _id: '2',
    title: 'Advanced Calculus',
    description: 'Explore advanced calculus concepts',
    category: 'Calculus',
    difficulty: 'Advanced',
    duration: 60,
    rating: 4.8,
    imageUrl: '/images/calculus.jpg',
    tags: ['calculus', 'advanced', 'derivatives'],
  },
];

const LessonService = {
  getLessons: jest.fn().mockResolvedValue(mockLessons),
  
  getLessonById: jest.fn().mockImplementation((id) => {
    const lesson = mockLessons.find(lesson => lesson._id === id);
    return Promise.resolve(lesson || null);
  }),
  
  createLesson: jest.fn().mockImplementation((lessonData) => {
    return Promise.resolve({ ...lessonData, _id: Math.random().toString(36).substr(2, 9) });
  }),
  
  updateLesson: jest.fn().mockImplementation((id, lessonData) => {
    return Promise.resolve({ ...lessonData, _id: id });
  }),
  
  deleteLesson: jest.fn().mockResolvedValue({ success: true }),
  
  submitFeedback: jest.fn().mockResolvedValue({ success: true }),
};

export default LessonService; 
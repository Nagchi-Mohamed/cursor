const mongoose = require('mongoose');
const PracticeSet = require('../../models/PracticeSet');
const Lesson = require('../../models/Lesson');
const { createTestUser } = require('../utils/testUtils');

describe('PracticeSet Model Tests', () => {
  let testUser;
  let testLesson;

  beforeAll(async () => {
    await global.connectToDatabase();
  });

    beforeEach(async () => {
    await global.clearDatabase();
    // Create a test user for use in submissions
    testUser = await createTestUser();
    // Create a test lesson to associate with practice sets
    testLesson = new Lesson({
      title: 'Test Lesson',
      description: 'Test lesson description',
      content: 'Test lesson content that is long enough.',
      module: 'Test Module',
      order: 1,
      createdBy: testUser._id,
      estimatedDuration: 60,
      author: testUser._id,
      category: 'Algebra'
    });
    await testLesson.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Schema Validation', () => {
    test('should create a valid practice set with all required fields', async () => {
      const practiceSetData = {
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        lesson: testLesson._id,
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.',
            points: 2,
            difficulty: 'Beginner'
          }
        ],
        timeLimit: 30,
        attemptsAllowed: 2,
        status: 'published'
      };

      const practiceSet = new PracticeSet(practiceSetData);
      const savedPracticeSet = await practiceSet.save();

      expect(savedPracticeSet._id).toBeDefined();
      expect(savedPracticeSet.title).toBe(practiceSetData.title);
      expect(savedPracticeSet.description).toBe(practiceSetData.description);
      expect(savedPracticeSet.lesson.toString()).toBe(testLesson._id.toString());
      expect(savedPracticeSet.topic).toBe(practiceSetData.topic);
      expect(savedPracticeSet.questions).toHaveLength(1);
      expect(savedPracticeSet.questions[0].questionText).toBe('What is 2+2?');
      expect(savedPracticeSet.timeLimit).toBe(30);
      expect(savedPracticeSet.attemptsAllowed).toBe(2);
      expect(savedPracticeSet.status).toBe('published');
      expect(savedPracticeSet.createdAt).toBeDefined();
      expect(savedPracticeSet.updatedAt).toBeDefined();
    });

    test('should fail when title is not provided', async () => {
      const practiceSetData = {
        // title is missing
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ]
      };

      const practiceSet = new PracticeSet(practiceSetData);
      
      await expect(practiceSet.save()).rejects.toThrow();
    });

    test('should fail when description is not provided', async () => {
      const practiceSetData = {
        title: 'Test Practice Set',
        // description is missing
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ]
      };

      const practiceSet = new PracticeSet(practiceSetData);
      
      await expect(practiceSet.save()).rejects.toThrow();
    });

    test('should fail when topic is not provided', async () => {
      const practiceSetData = {
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        // topic is missing
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ]
      };

      const practiceSet = new PracticeSet(practiceSetData);
      
      await expect(practiceSet.save()).rejects.toThrow();
    });

    test('should properly trim the title field', async () => {
      const practiceSetData = {
        title: '  Test Practice Set  ', // With extra spaces to be trimmed
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ]
      };

      const practiceSet = new PracticeSet(practiceSetData);
      const savedPracticeSet = await practiceSet.save();

      expect(savedPracticeSet.title).toBe('Test Practice Set'); // Spaces should be trimmed
    });
  });

  describe('Questions Subschema', () => {
    test('should validate question requirements', async () => {
      // Missing required field questionText
      const practiceSetData = {
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            // questionText is missing
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ]
      };

      const practiceSet = new PracticeSet(practiceSetData);
      
      await expect(practiceSet.save()).rejects.toThrow();
    });

    test('should validate question type enum', async () => {
      const practiceSetData = {
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'invalid-type', // Invalid enum value
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ]
      };

      const practiceSet = new PracticeSet(practiceSetData);
      
      await expect(practiceSet.save()).rejects.toThrow();
    });

    test('should validate difficulty enum', async () => {
      const practiceSetData = {
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.',
            difficulty: 'Invalid' // Invalid enum value
          }
        ]
      };

      const practiceSet = new PracticeSet(practiceSetData);
      
      await expect(practiceSet.save()).rejects.toThrow();
    });

    test('should use default values for question fields', async () => {
      const practiceSetData = {
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
            // points and difficulty not provided - should use defaults
          }
        ]
      };

      const practiceSet = new PracticeSet(practiceSetData);
      const savedPracticeSet = await practiceSet.save();

      expect(savedPracticeSet.questions[0].points).toBe(1); // Default points value
      expect(savedPracticeSet.questions[0].difficulty).toBe('Beginner'); // Default difficulty
    });
  });

  describe('Submissions Subschema', () => {
    test('should create and validate a submission', async () => {
      // First create a practice set
      const practiceSet = await new PracticeSet({
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.',
            points: 2
          }
        ]
      }).save();

      // Create a question reference ID
      const questionId = practiceSet.questions[0]._id;

      // Add a submission to the practice set
      practiceSet.submissions.push({
        student: testUser._id,
        answers: [
          {
            question: questionId,
            answer: '4',
            isCorrect: true,
            points: 2,
            feedback: 'Correct!'
          }
        ],
        score: 2,
        status: 'graded'
      });

      const updatedPracticeSet = await practiceSet.save();

      expect(updatedPracticeSet.submissions).toHaveLength(1);
      expect(updatedPracticeSet.submissions[0].student.toString()).toBe(testUser._id.toString());
      expect(updatedPracticeSet.submissions[0].answers).toHaveLength(1);
      expect(updatedPracticeSet.submissions[0].answers[0].answer).toBe('4');
      expect(updatedPracticeSet.submissions[0].answers[0].isCorrect).toBe(true);
      expect(updatedPracticeSet.submissions[0].score).toBe(2);
      expect(updatedPracticeSet.submissions[0].status).toBe('graded');
      expect(updatedPracticeSet.submissions[0].submittedAt).toBeDefined();
    });

    test('should fail when student is not provided for submission', async () => {
      // First create a practice set
      const practiceSet = await new PracticeSet({
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ]
      }).save();

      // Create a question reference ID
      const questionId = practiceSet.questions[0]._id;

      // Add an invalid submission missing the student field
      practiceSet.submissions.push({
        // student field is missing
        answers: [
          {
            question: questionId,
            answer: '4',
            isCorrect: true
          }
        ],
        score: 1
      });

      await expect(practiceSet.save()).rejects.toThrow();
    });

    test('should validate submission status enum', async () => {
      // First create a practice set
      const practiceSet = await new PracticeSet({
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ]
      }).save();

      // Create a question reference ID
      const questionId = practiceSet.questions[0]._id;

      // Add a submission with invalid status
      practiceSet.submissions.push({
        student: testUser._id,
        answers: [
          {
            question: questionId,
            answer: '4',
            isCorrect: true
          }
        ],
        score: 1,
        status: 'invalid-status' // Invalid enum value
      });

      await expect(practiceSet.save()).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    test('should set default values correctly', async () => {
      const practiceSetData = {
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ]
      };

      const practiceSet = new PracticeSet(practiceSetData);
      const savedPracticeSet = await practiceSet.save();

      expect(savedPracticeSet.totalPoints).toBe(1); // Calculated from the single question with default 1 point
      expect(savedPracticeSet.timeLimit).toBeNull(); // Default value
      expect(savedPracticeSet.attemptsAllowed).toBe(1); // Default value
      expect(savedPracticeSet.status).toBe('draft'); // Default value
      expect(savedPracticeSet.submissions).toEqual([]); // Default empty array
    });
  });

  describe('Status Enum', () => {
    test('should validate status enum', async () => {
      const practiceSetData = {
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ],
        status: 'invalid-status' // Invalid enum value
      };

      const practiceSet = new PracticeSet(practiceSetData);
      
      await expect(practiceSet.save()).rejects.toThrow();
    });

    test('should allow all valid status values', async () => {
      // Test all valid status values
      const statuses = ['draft', 'published', 'archived'];
      
      for (const status of statuses) {
        const practiceSet = new PracticeSet({
          title: `Test Practice Set - ${status}`,
          description: 'This is a test practice set.',
          topic: 'Algebra',
          questions: [
            {
              questionText: 'What is 2+2?',
              questionType: 'multiple-choice',
              options: ['3', '4', '5', '6'],
              correctAnswer: '4',
              explanation: 'Basic addition.'
            }
          ],
          status
        });
        
        const savedPracticeSet = await practiceSet.save();
        expect(savedPracticeSet.status).toBe(status);
      }
    });
  });

  describe('Hooks', () => {
    test('pre-save hook should update updatedAt timestamp', async () => {
      // Create a practice set
      const practiceSet = await new PracticeSet({
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'What is 2+2?',
            questionType: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Basic addition.'
          }
        ]
      }).save();
      
      const originalUpdatedAt = practiceSet.updatedAt;
      
      // Wait to ensure timestamp would be different
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Update the practice set
      practiceSet.title = 'Updated Test Practice Set';
      await practiceSet.save();
      
      // Verify updatedAt was updated
      expect(practiceSet.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    test('pre-save hook should calculate totalPoints from questions', async () => {
      // Create a practice set with multiple questions
      const practiceSet = await new PracticeSet({
        title: 'Test Practice Set',
        description: 'This is a test practice set.',
        topic: 'Algebra',
        questions: [
          {
            questionText: 'Question 1',
            questionType: 'multiple-choice',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'B',
            explanation: 'Explanation 1',
            points: 2
          },
          {
            questionText: 'Question 2',
            questionType: 'short-answer',
            correctAnswer: 'Answer',
            explanation: 'Explanation 2',
            points: 3
          }
        ]
      }).save();
      
      // Verify totalPoints was calculated correctly
      expect(practiceSet.totalPoints).toBe(5); // 2 + 3
      
      // Add another question and update
      practiceSet.questions.push({
        questionText: 'Question 3',
        questionType: 'essay_mathjax',
        correctAnswer: 'Answer 3',
        explanation: 'Explanation 3',
        points: 4
      });
      
      await practiceSet.save();
      
      // Verify totalPoints was recalculated
      expect(practiceSet.totalPoints).toBe(9); // 2 + 3 + 4
    });
  });

  describe('Indexes', () => {
    test('should have text indexes on title, description, and topic', async () => {
      // Create multiple practice sets
      await Promise.all([
        new PracticeSet({
          title: 'Algebra Fundamentals',
          description: 'Learn basic algebraic concepts.',
          topic: 'Algebra',
          questions: [{
            questionText: 'Question',
            questionType: 'multiple-choice',
            options: ['A', 'B'],
            correctAnswer: 'A',
            explanation: 'Explanation'
          }]
        }).save(),
        
        new PracticeSet({
          title: 'Geometry Basics',
          description: 'Introduction to geometry with algebraic concepts.',
          topic: 'Geometry',
          questions: [{
            questionText: 'Question',
            questionType: 'multiple-choice',
            options: ['A', 'B'],
            correctAnswer: 'A',
            explanation: 'Explanation'
          }]
        }).save(),
        
        new PracticeSet({
          title: 'Advanced Calculus',
          description: 'Deep dive into calculus.',
          topic: 'Calculus',
          questions: [{
            questionText: 'Question',
            questionType: 'multiple-choice',
            options: ['A', 'B'],
            correctAnswer: 'A',
            explanation: 'Explanation'
          }]
        }).save()
      ]);
      
      // Check that indexes are working by performing text searches
      const algebraResults = await PracticeSet.find({ $text: { $search: 'algebra' } });
      expect(algebraResults.length).toBeGreaterThanOrEqual(1);
      
      const geometryResults = await PracticeSet.find({ $text: { $search: 'geometry' } });
      expect(geometryResults.length).toBeGreaterThanOrEqual(1);
      
      const calculusResults = await PracticeSet.find({ $text: { $search: 'calculus' } });
      expect(calculusResults.length).toBeGreaterThanOrEqual(1);
    });
  });
}); 
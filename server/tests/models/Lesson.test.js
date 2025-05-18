const mongoose = require('mongoose');
const Lesson = require('../../models/Lesson');
const { createTestUser } = require('../utils/testUtils');

describe('Lesson Model Tests', () => {
  let testAuthor;

  beforeAll(async () => {
    await global.connectToDatabase();
    // Create a test user to be used as author for lessons
    testAuthor = await createTestUser();
  });

  beforeEach(async () => {
    await global.clearDatabase();
    // Recreate the test author for each test
    testAuthor = await createTestUser();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Schema Validation', () => {
    test('should create a valid lesson with all required fields', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60,
        status: 'draft'
      };

      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();

      expect(savedLesson._id).toBeDefined();
      expect(savedLesson.title).toBe(lessonData.title);
      expect(savedLesson.content).toBe(lessonData.content);
      expect(savedLesson.category).toBe(lessonData.category);
      expect(savedLesson.difficulty).toBe(lessonData.difficulty);
      expect(savedLesson.author.toString()).toBe(testAuthor._id.toString());
      expect(savedLesson.estimatedDuration).toBe(lessonData.estimatedDuration);
      expect(savedLesson.status).toBe(lessonData.status);
      expect(savedLesson.createdAt).toBeDefined();
      expect(savedLesson.updatedAt).toBeDefined();
    });

    test('should fail when title is not provided', async () => {
      const lessonData = {
        // title is missing
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60
      };

      const lesson = new Lesson(lessonData);
      
      await expect(lesson.save()).rejects.toThrow();
    });

    test('should fail when content is not provided', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        // content is missing
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60
      };

      const lesson = new Lesson(lessonData);
      
      await expect(lesson.save()).rejects.toThrow();
    });

    test('should fail when category is not provided', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        // category is missing
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60
      };

      const lesson = new Lesson(lessonData);
      
      await expect(lesson.save()).rejects.toThrow();
    });

    test('should fail when author is not provided', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        // author is missing
        estimatedDuration: 60
      };

      const lesson = new Lesson(lessonData);
      
      await expect(lesson.save()).rejects.toThrow();
    });

    test('should fail when estimatedDuration is not provided', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        // estimatedDuration is missing
      };

      const lesson = new Lesson(lessonData);
      
      await expect(lesson.save()).rejects.toThrow();
    });

    test('should use default status when not provided', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60
        // status is not provided, should default to 'draft'
      };

      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();

      expect(savedLesson.status).toBe('draft');
    });

    test('should use default difficulty when not provided', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        // difficulty is not provided, should default to 'Beginner'
        author: testAuthor._id,
        estimatedDuration: 60
      };

      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();

      expect(savedLesson.difficulty).toBe('Beginner');
    });

    test('should fail when an invalid category is provided', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'InvalidCategory', // Not in enum
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60
      };

      const lesson = new Lesson(lessonData);
      
      await expect(lesson.save()).rejects.toThrow();
    });

    test('should fail when an invalid difficulty is provided', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'InvalidDifficulty', // Not in enum
        author: testAuthor._id,
        estimatedDuration: 60
      };

      const lesson = new Lesson(lessonData);
      
      await expect(lesson.save()).rejects.toThrow();
    });

    test('should fail when an invalid status is provided', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60,
        status: 'InvalidStatus' // Not in enum
      };

      const lesson = new Lesson(lessonData);
      
      await expect(lesson.save()).rejects.toThrow();
    });

    test('should properly trim the title field', async () => {
      const lessonData = {
        title: '  Introduction to Algebra  ', // With extra spaces to be trimmed
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60
      };

      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();

      expect(savedLesson.title).toBe('Introduction to Algebra'); // Spaces should be trimmed
    });
  });

  describe('Array Fields', () => {
    test('should save lesson with practiceSets array', async () => {
      const practiceSetId1 = new mongoose.Types.ObjectId();
      const practiceSetId2 = new mongoose.Types.ObjectId();
      
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60,
        practiceSets: [practiceSetId1, practiceSetId2]
      };

      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();

      expect(savedLesson.practiceSets).toHaveLength(2);
      expect(savedLesson.practiceSets[0].toString()).toBe(practiceSetId1.toString());
      expect(savedLesson.practiceSets[1].toString()).toBe(practiceSetId2.toString());
    });

    test('should save lesson with prerequisites array', async () => {
      const prerequisiteId1 = new mongoose.Types.ObjectId();
      const prerequisiteId2 = new mongoose.Types.ObjectId();
      
      const lessonData = {
        title: 'Advanced Algebra',
        content: 'This is advanced algebra content.',
        category: 'Algebra',
        difficulty: 'Advanced',
        author: testAuthor._id,
        estimatedDuration: 90,
        prerequisites: [prerequisiteId1, prerequisiteId2]
      };

      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();

      expect(savedLesson.prerequisites).toHaveLength(2);
      expect(savedLesson.prerequisites[0].toString()).toBe(prerequisiteId1.toString());
      expect(savedLesson.prerequisites[1].toString()).toBe(prerequisiteId2.toString());
    });

    test('should save lesson with tags array', async () => {
      const tags = ['algebra', 'basics', 'equations'];
      
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60,
        tags
      };

      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();

      expect(savedLesson.tags).toHaveLength(3);
      expect(savedLesson.tags).toEqual(expect.arrayContaining(tags));
    });

    test('should save lesson with resources array', async () => {
      const resources = [
        {
          title: 'Algebra Video Tutorial',
          type: 'video',
          url: 'https://example.com/video',
          description: 'A helpful video tutorial on algebra'
        },
        {
          title: 'Algebra Practice PDF',
          type: 'document',
          url: 'https://example.com/pdf',
          description: 'PDF with practice problems'
        }
      ];
      
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60,
        resources
      };

      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();

      expect(savedLesson.resources).toHaveLength(2);
      expect(savedLesson.resources[0].title).toBe(resources[0].title);
      expect(savedLesson.resources[0].type).toBe(resources[0].type);
      expect(savedLesson.resources[0].url).toBe(resources[0].url);
      expect(savedLesson.resources[0].description).toBe(resources[0].description);
      
      expect(savedLesson.resources[1].title).toBe(resources[1].title);
      expect(savedLesson.resources[1].type).toBe(resources[1].type);
      expect(savedLesson.resources[1].url).toBe(resources[1].url);
      expect(savedLesson.resources[1].description).toBe(resources[1].description);
    });

    test('should fail when a resource has an invalid type', async () => {
      const resources = [
        {
          title: 'Invalid Resource',
          type: 'invalidType', // Not in enum
          url: 'https://example.com/resource',
          description: 'This has an invalid type'
        }
      ];
      
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60,
        resources
      };

      const lesson = new Lesson(lessonData);
      
      await expect(lesson.save()).rejects.toThrow();
    });
  });

  describe('Pre-save Hook', () => {
    test('should update the updatedAt field on save', async () => {
      // Create initial lesson
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60
      };

      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();
      
      // Store the original timestamps
      const originalCreatedAt = savedLesson.createdAt;
      const originalUpdatedAt = savedLesson.updatedAt;
      
      // Wait a bit to ensure timestamps would be different
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Update the lesson
      savedLesson.title = 'Updated Introduction to Algebra';
      await savedLesson.save();
      
      // Verify timestamps
      expect(savedLesson.createdAt.getTime()).toBe(originalCreatedAt.getTime()); // createdAt should not change
      expect(savedLesson.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime()); // updatedAt should be updated
    });
  });

  describe('Timestamps', () => {
    test('should auto-generate createdAt and updatedAt fields', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id,
        estimatedDuration: 60
      };

      const before = new Date();
      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();
      const after = new Date();

      expect(savedLesson.createdAt).toBeInstanceOf(Date);
      expect(savedLesson.updatedAt).toBeInstanceOf(Date);
      
      // Verify timestamps are within the expected range
      expect(savedLesson.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(savedLesson.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(savedLesson.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(savedLesson.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('References', () => {
    test('should properly reference a User as author', async () => {
      const lessonData = {
        title: 'Introduction to Algebra',
        content: 'This is a comprehensive introduction to algebra.',
        category: 'Algebra',
        difficulty: 'Beginner',
        author: testAuthor._id, // Using the testAuthor created in beforeEach
        estimatedDuration: 60
      };

      const lesson = new Lesson(lessonData);
      const savedLesson = await lesson.save();

      expect(savedLesson.author.toString()).toBe(testAuthor._id.toString());
    });
  });
}); 
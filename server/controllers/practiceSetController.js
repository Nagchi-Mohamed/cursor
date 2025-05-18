const { validationResult } = require('express-validator');
const PracticeSet = require('../models/PracticeSet');
const User = require('../models/User');

// Create a new practice set
exports.createPracticeSet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const practiceSet = new PracticeSet({
      ...req.body,
      author: req.user._id
    });

    await practiceSet.save();
    res.status(201).json(practiceSet);
  } catch (error) {
    console.error('Create practice set error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all practice sets with filtering and pagination
exports.getPracticeSets = async (req, res) => {
  try {
    const {
      lesson,
      topic,
      difficulty,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status: 'published' };
    if (lesson) query.lesson = lesson;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const practiceSets = await PracticeSet.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('lesson', 'title')
      .select('-questions.correctAnswer'); // Exclude correct answers

    // Get total count for pagination
    const total = await PracticeSet.countDocuments(query);

    res.json({
      practiceSets,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPracticeSets: total
    });
  } catch (error) {
    console.error('Get practice sets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single practice set by ID
exports.getPracticeSet = async (req, res) => {
  try {
    const practiceSet = await PracticeSet.findById(req.params.id)
      .populate('lesson', 'title')
      .select('-questions.correctAnswer'); // Exclude correct answers

    if (!practiceSet) {
      return res.status(404).json({ message: 'Practice set not found' });
    }

    res.json(practiceSet);
  } catch (error) {
    console.error('Get practice set error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a practice set
exports.updatePracticeSet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const practiceSet = await PracticeSet.findById(req.params.id);
    if (!practiceSet) {
      return res.status(404).json({ message: 'Practice set not found' });
    }

    // Check if user is the author or an admin
    if (practiceSet.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this practice set' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      practiceSet[key] = req.body[key];
    });

    await practiceSet.save();
    res.json(practiceSet);
  } catch (error) {
    console.error('Update practice set error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a practice set
exports.deletePracticeSet = async (req, res) => {
  try {
    const practiceSet = await PracticeSet.findById(req.params.id);
    if (!practiceSet) {
      return res.status(404).json({ message: 'Practice set not found' });
    }

    // Check if user is the author or an admin
    if (practiceSet.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this practice set' });
    }

    // Instead of deleting, mark as archived
    practiceSet.status = 'archived';
    await practiceSet.save();

    res.json({ message: 'Practice set archived successfully' });
  } catch (error) {
    console.error('Delete practice set error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit answers for a practice set
exports.submitPracticeSet = async (req, res) => {
  try {
    const { answers } = req.body;
    const practiceSet = await PracticeSet.findById(req.params.id);

    if (!practiceSet) {
      return res.status(404).json({ message: 'Practice set not found' });
    }

    // Check if practice set is published
    if (practiceSet.status !== 'published') {
      return res.status(400).json({ message: 'Practice set is not available' });
    }

    // Check if user has exceeded attempts
    const userAttempts = practiceSet.submissions.filter(
      sub => sub.student.toString() === req.user._id.toString()
    ).length;

    if (userAttempts >= practiceSet.attemptsAllowed) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    // Grade the submission
    const gradedAnswers = answers.map(answer => {
      const question = practiceSet.questions.id(answer.questionId);
      const isCorrect = this.checkAnswer(question, answer.answer);
      return {
        question: answer.questionId,
        answer: answer.answer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        feedback: isCorrect ? 'Correct!' : question.explanation
      };
    });

    // Calculate total score
    const score = gradedAnswers.reduce((sum, answer) => sum + answer.points, 0);

    // Create submission
    const submission = {
      student: req.user._id,
      answers: gradedAnswers,
      score,
      submittedAt: new Date(),
      status: 'graded'
    };

    practiceSet.submissions.push(submission);
    await practiceSet.save();

    // Update user's progress
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        'progress.completedPracticeSets': {
          practiceSet: practiceSet._id,
          score,
          completedAt: new Date()
        }
      }
    });

    res.json({
      submission,
      totalScore: score,
      maxScore: practiceSet.totalPoints
    });
  } catch (error) {
    console.error('Submit practice set error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper method to check answers
exports.checkAnswer = (question, answer) => {
  switch (question.questionType) {
    case 'multiple-choice':
      return answer === question.correctAnswer;
    case 'short-answer':
      return answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    case 'essay_mathjax':
      // For essay questions, we'll need more sophisticated checking
      // This is a placeholder for future implementation
      return false;
    default:
      return false;
  }
}; 
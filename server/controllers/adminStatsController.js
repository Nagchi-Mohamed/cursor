const User = require('../models/User');
const Lesson = require('../models/Lesson');
const PracticeSet = require('../models/PracticeSet');
const ForumThread = require('../models/ForumThread');
const ForumPost = require('../models/ForumPost');
const Feedback = require('../models/Feedback');

exports.getPlatformStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      newUsersLast7Days,
      totalLessons,
      publishedLessons,
      totalPracticeSets,
      totalForumThreads,
      totalForumPosts,
      pendingFeedbackCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Lesson.countDocuments(),
      Lesson.countDocuments({ published: true }),
      PracticeSet.countDocuments(),
      ForumThread.countDocuments(),
      ForumPost.countDocuments(),
      Feedback.countDocuments({ status: { $in: ['New', 'In Progress'] } })
    ]);

    // Get user registration trend for the last 7 days
    const userRegistrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get content creation trend
    const contentCreationTrend = await Lesson.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          newUsersLast7Days,
          totalLessons,
          publishedLessons,
          totalPracticeSets,
          totalForumThreads,
          totalForumPosts,
          pendingFeedbackCount
        },
        trends: {
          userRegistration: userRegistrationTrend,
          contentCreation: contentCreationTrend
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching platform statistics'
    });
  }
}; 
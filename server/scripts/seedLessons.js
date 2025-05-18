const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');
require('dotenv').config();

const sampleLessons = [
  {
    title: "Introduction to Algebra",
    content: "<p>This is the <strong>first lesson</strong> in Algebra. We will cover variables and basic equations.</p><p>Here's a simple equation: <span class='math-tex'>x + 5 = 10</span></p>",
    category: "Algebra",
    difficulty: "Beginner",
    description: "Learn the fundamentals of algebra, including variables, expressions, and simple equations.",
    estimatedDuration: 30,
    tags: ["variables", "equations", "algebra basics"],
    resources: [
      {
        title: "Algebra Basics Worksheet",
        type: "worksheet",
        url: "/resources/algebra-basics.pdf"
      }
    ]
  },
  {
    title: "Understanding Derivatives",
    content: "<p>Calculus begins with understanding limits and derivatives.</p><p>The derivative of <span class='math-tex'>f(x) = x^2</span> is <span class='math-tex'>f'(x) = 2x</span>.</p>",
    category: "Calculus",
    difficulty: "Intermediate",
    description: "Explore the concept of derivatives and their applications in calculus.",
    estimatedDuration: 45,
    tags: ["derivatives", "calculus", "limits"],
    resources: [
      {
        title: "Derivatives Practice Problems",
        type: "worksheet",
        url: "/resources/derivatives-practice.pdf"
      }
    ]
  },
  {
    title: "Basic Geometry: Triangles",
    content: "<p>Triangles are fundamental shapes in geometry. Let's explore their properties and types.</p><p>The sum of angles in a triangle is always <span class='math-tex'>180°</span>.</p>",
    category: "Geometry",
    difficulty: "Beginner",
    description: "Learn about different types of triangles and their properties.",
    estimatedDuration: 35,
    tags: ["triangles", "angles", "geometry basics"],
    resources: [
      {
        title: "Triangle Properties Guide",
        type: "pdf",
        url: "/resources/triangle-properties.pdf"
      }
    ]
  },
  {
    title: "Introduction to Statistics",
    content: "<p>Statistics helps us understand and analyze data. We'll cover basic concepts like mean, median, and mode.</p><p>The mean is calculated as: <span class='math-tex'>\\frac{\\sum x_i}{n}</span></p>",
    category: "Statistics",
    difficulty: "Beginner",
    description: "Learn the basics of statistical analysis and data interpretation.",
    estimatedDuration: 40,
    tags: ["statistics", "data analysis", "mean median mode"],
    resources: [
      {
        title: "Statistics Basics Worksheet",
        type: "worksheet",
        url: "/resources/statistics-basics.pdf"
      }
    ]
  },
  {
    title: "Prime Numbers and Factorization",
    content: "<p>Prime numbers are the building blocks of all numbers. Let's explore their properties and applications.</p><p>Every number can be expressed as a product of prime factors.</p>",
    category: "Number Theory",
    difficulty: "Intermediate",
    description: "Explore prime numbers, factorization, and their importance in mathematics.",
    estimatedDuration: 50,
    tags: ["prime numbers", "factorization", "number theory"],
    resources: [
      {
        title: "Prime Numbers Exercise Set",
        type: "worksheet",
        url: "/resources/prime-numbers.pdf"
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing lessons
    await Lesson.deleteMany({});
    console.log('Cleared existing lessons');

    // Insert sample lessons
    const createdLessons = await Lesson.insertMany(sampleLessons);
    console.log(`Successfully seeded ${createdLessons.length} lessons`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase(); 
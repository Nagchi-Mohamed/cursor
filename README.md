# MathSphere

MathSphere is a self-directed learning platform for mathematics, focusing on interactive lessons, practice sets, and individual progress tracking.

## Features

- Interactive mathematics lessons grouped by content categories
- Practice sets with automated grading
- Individual progress tracking
- Discussion forums
- Achievement system
- Multi-language support (English, French, Spanish)

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO for real-time features

### Frontend
- React
- Material-UI v5
- React Router v6
- i18next for internationalization
- KaTeX for math rendering

## Project Structure

```
MathSphere/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # Reusable components
│       ├── contexts/      # React contexts
│       ├── pages/         # Page components
│       └── services/      # API services
└── server/                # Node.js backend
    ├── config/           # Configuration files
    ├── controllers/      # Route controllers
    ├── middleware/       # Custom middleware
    ├── models/          # Mongoose models
    └── routes/          # API routes
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mathsphere
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## Development

- Backend API runs on http://localhost:5000
- Frontend development server runs on http://localhost:3000

## License

MIT 
# Lifetracker Pro - Backend API

Comprehensive backend API for the Lifetracker Pro mobile application built with Express.js and PostgreSQL.

## 🎯 Features

- 🔐 **Secure Authentication**: JWT-based authentication with refresh tokens
- 🎯 **Habit Tracking**: Create, update, and track daily habits with streaks
- 🏆 **Goal Management**: Set milestones and track goal progress
- 💪 **Fitness Tracking**: Log workouts, exercises, and body measurements
- 🍎 **Nutrition Tracking**: Track meals, calories, and macronutrients
- ✅ **Task Management**: Manage tasks with priorities and due dates
- 💰 **Expense Tracking**: Track expenses with budget management
- 📝 **Journal & Mood**: Journal entries with mood tracking
- 📊 **Analytics**: Comprehensive data analytics and insights
- ⚡ **Rate Limiting**: API rate limiting for security
- 🔄 **Redis Caching**: Optional Redis caching for performance
- 📤 **Data Export**: Export user data in various formats

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Caching**: Redis (optional)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Custom validators + joi
- **Security**: bcryptjs for password hashing
- **Rate Limiting**: express-rate-limit
- **Environment**: dotenv
- **Development**: Nodemon

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                  # Express app configuration
│   ├── server.js               # Server entry point
│   ├── config/
│   │   ├── database.js         # PostgreSQL connection pool
│   │   ├── env.js              # Environment variables
│   │   └── redis.js            # Redis connection (optional)
│   ├── controllers/            # Request handlers
│   │   ├── authController.js
│   │   ├── habitController.js
│   │   ├── goalController.js
│   │   ├── bodyController.js
│   │   ├── calorieController.js
│   │   ├── taskController.js
│   │   ├── expenseController.js
│   │   ├── journalController.js
│   │   └── dashboardController.js
│   ├── models/                 # Database models
│   │   ├── User.js
│   │   ├── Habit.js
│   │   ├── HabitLog.js
│   │   ├── Goal.js
│   │   ├── Workout.js
│   │   ├── Meal.js
│   │   ├── Task.js
│   │   ├── Expense.js
│   │   ├── JournalEntry.js
│   │   └── Measurement.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── habits.js
│   │   ├── goals.js
│   │   ├── body.js
│   │   ├── calories.js
│   │   ├── tasks.js
│   │   ├── expenses.js
│   │   ├── journal.js
│   │   └── dashboard.js
│   ├── middleware/             # Express middleware
│   │   ├── auth.js             # JWT authentication
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── rateLimiter.js      # Rate limiting
│   │   └── validator.js        # Request validation
│   ├── services/               # Business logic
│   ├── validators/             # Input validation schemas
│   ├── utils/                  # Utility functions
│   └── database/
│       ├── schema.sql          # Database schema
│       ├── migrate.js          # Migration runner
│       ├── seed.js             # Database seeder
│       ├── migrations/         # Migration files
│       └── seeds/              # Seed data files
├── tests/                      # Test files
│   ├── unit/
│   ├── integration/
│   └── helpers/
├── .env.example                # Example environment variables
├── package.json                # Dependencies
├── nodemon.json                # Nodemon config
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- PostgreSQL v12 or higher
- Redis (optional, for caching)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment configuration**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` with your settings:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/lifetracker
   
   # Redis (optional)
   REDIS_URL=redis://localhost:6379
   
   # Authentication
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRY=7d
   REFRESH_TOKEN_EXPIRY=30d
   
   # Security
   BCRYPT_ROUNDS=10
   
   # Server
   PORT=5000
   NODE_ENV=development
   ```

5. **Setup database**
   ```bash
   npm run migrate
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "height": 180,
  "weight": 75,
  "calorie_goal": 2500
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### Refresh Token
```
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
```

### Habits Endpoints

#### Get All Habits
```
GET /api/habits
Authorization: Bearer <token>
```

#### Create Habit
```
POST /api/habits
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Morning Exercise",
  "description": "30 minutes of exercise",
  "frequency": "daily",
  "category": "health",
  "color": "#FF6B6B"
}
```

#### Update Habit
```
PUT /api/habits/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Habit
```
DELETE /api/habits/:id
Authorization: Bearer <token>
```

#### Log Habit Completion
```
POST /api/habit-logs
Authorization: Bearer <token>
Content-Type: application/json

{
  "habit_id": 1,
  "date": "2024-01-15",
  "notes": "Felt great!"
}
```

### Goals Endpoints

#### Get All Goals
```
GET /api/goals
Authorization: Bearer <token>
```

#### Create Goal
```
POST /api/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Run a Marathon",
  "description": "Complete a full marathon",
  "category": "fitness",
  "target_date": "2024-12-31",
  "priority": "high"
}
```

### Workouts Endpoints

#### Get Workouts
```
GET /api/workouts
Authorization: Bearer <token>
?date=2024-01-15&limit=10&offset=0
```

#### Create Workout
```
POST /api/workouts
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "Running",
  "duration_minutes": 30,
  "calories_burned": 350,
  "distance_km": 5.2,
  "date": "2024-01-15",
  "notes": "Great run!"
}
```

### Tasks Endpoints

#### Get Tasks
```
GET /api/tasks
Authorization: Bearer <token>
?status=pending&priority=high
```

#### Create Task
```
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete report",
  "description": "Finish the quarterly report",
  "due_date": "2024-01-20",
  "priority": "high",
  "category": "work"
}
```

### Expenses Endpoints

#### Get Expenses
```
GET /api/expenses
Authorization: Bearer <token>
?month=2024-01&category=food
```

#### Create Expense
```
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 45.99,
  "category": "food",
  "description": "Groceries",
  "date": "2024-01-15"
}
```

### Journal Endpoints

#### Get Entries
```
GET /api/journal
Authorization: Bearer <token>
?month=2024-01
```

#### Create Entry
```
POST /api/journal
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Great day",
  "content": "Had a wonderful day today...",
  "mood": "happy",
  "date": "2024-01-15"
}
```

## 🏗️ Database Schema

The database includes tables for:
- `users` - User accounts
- `habits` - User habits
- `habit_logs` - Habit completions
- `goals` - User goals
- `workouts` - Workout sessions
- `meals` - Meal entries
- `tasks` - User tasks
- `expenses` - Expense records
- `journal_entries` - Journal entries

## 🔒 Authentication & Security

- **JWT**: All endpoints (except auth) require a valid JWT token in the `Authorization` header
- **Password Hashing**: Passwords are hashed using bcryptjs with 10 rounds
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse
- **CORS**: Configured for frontend communication
- **Input Validation**: All inputs are validated before processing

## 📊 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

## 📦 Available Scripts

```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run migrate    # Run database migrations
npm run seed       # Seed database with sample data
npm run lint       # Lint code
npm test           # Run tests
```

## 🚀 Deployment

### Environment Variables for Production

Set these environment variables on your hosting platform:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (optional)
- `JWT_SECRET` - Secure JWT secret key
- `NODE_ENV` - Set to `production`
- `PORT` - Server port (usually 5000)

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/feature-name`
5. Create Pull Request

## 📄 License

This project is proprietary and confidential.

---

**Built with ❤️ for comprehensive life tracking**

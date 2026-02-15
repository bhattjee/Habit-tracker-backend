# Habit Tracker API

Backend API for the Habit Tracker mobile application.

## Features

- 🔐 Secure authentication with JWT
- ✅ Task management with streaks
- 💰 Expense tracking with budgets
- 🍎 Calorie tracking with macros
- 🎯 Habit tracking with streaks
- 💪 Workout and body measurement logging
- 📔 Journal entries with mood tracking
- 🎯 Goal setting and progress tracking
- 📊 Comprehensive analytics
- 📤 Data export (CSV)

## Tech Stack

- Node.js & Express
- PostgreSQL
- Redis (optional caching)
- JWT Authentication
- Winston (logging)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
   npm install
```

3. Create `.env` file (see `.env.example`)

4. Setup database:
```bash
   npm run migrate
   npm run seed
```

5. Start server:
```bash
   # Development
   npm run dev

   # Production
   npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- POST `/api/auth/refresh` - Refresh token
- POST `/api/auth/logout` - Logout
- GET `/api/auth/profile` - Get profile
- PUT `/api/auth/profile` - Update profile

### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create task
- PUT `/api/tasks/:id` - Update task
- PATCH `/api/tasks/:id/toggle` - Toggle completion
- DELETE `/api/tasks/:id` - Delete task

### Expenses
- GET `/api/expenses` - Get expenses
- GET `/api/expenses/summary` - Get summary
- POST `/api/expenses` - Create expense
- PUT `/api/expenses/:id` - Update expense
- DELETE `/api/expenses/:id` - Delete expense

### Dashboard
- GET `/api/dashboard` - Get dashboard data
- GET `/api/dashboard/quick-stats` - Get quick stats

[Add more endpoints...]

## Database Schema

See `src/database/schema.sql` for complete schema.

## Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet security headers
- Input validation
- SQL injection prevention

## License

MIT
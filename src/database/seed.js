const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Create demo user
    const hashedPassword = await bcrypt.hash('Demo@123', 10);
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash, height, weight, calorie_goal, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['Demo User', 'demo@habittracker.com', hashedPassword, 175, 70, 2000, true]
    );

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      logger.info(`Demo user created with ID: ${userId}`);

      // Seed expense categories
      const categories = [
        'Baby', 'Beauty', 'Bills', 'Food', 'Shopping', 
        'Social', 'Tax', 'Car', 'Rent', 'Health', 
        'Education', 'Entertainment', 'Travel', 'Other'
      ];

      // Seed default affirmations
      const affirmations = [
        { text: 'I am capable of achieving my goals', category: 'Success' },
        { text: 'I choose health and vitality every day', category: 'Health' },
        { text: 'I am grateful for all that I have', category: 'Gratitude' },
        { text: 'I am confident in my abilities', category: 'Confidence' },
        { text: 'I attract positive energy', category: 'Positivity' },
      ];

      for (const aff of affirmations) {
        await pool.query(
          'INSERT INTO affirmations (user_id, text, category) VALUES ($1, $2, $3)',
          [userId, aff.text, aff.category]
        );
      }

      logger.info('Seed data inserted successfully');
    }

    logger.info('Database seeding completed');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
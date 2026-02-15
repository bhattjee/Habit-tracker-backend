const cron = require('node-cron');
const { query } = require('../config/database');
const logger = require('../utils/logger');

class NotificationService {
  static initialize() {
    // Run daily at 8 AM to send habit reminders
    cron.schedule('0 8 * * *', async () => {
      await this.sendHabitReminders();
    });

    // Run daily at 9 PM to send task reminders
    cron.schedule('0 21 * * *', async () => {
      await this.sendTaskReminders();
    });

    logger.info('Notification service initialized');
  }

  static async sendHabitReminders() {
    try {
      const result = await query(
        `SELECT h.id, h.name, h.user_id, u.email, u.name as user_name
         FROM habits h
         JOIN users u ON h.user_id = u.id
         WHERE h.is_active = true 
         AND h.reminder_enabled = true
         AND h.reminder_time <= CURRENT_TIME
         AND NOT EXISTS (
           SELECT 1 FROM habit_logs hl
           WHERE hl.habit_id = h.id AND hl.date = CURRENT_DATE
         )`
      );

      logger.info(`Sending ${result.rows.length} habit reminders`);
      
      // Here you would integrate with email service or push notification service
      // For now, just log
      result.rows.forEach(habit => {
        logger.info(`Reminder for user ${habit.user_id}: Complete habit "${habit.name}"`);
      });

      return result.rows.length;
    } catch (error) {
      logger.error('Error sending habit reminders:', error);
      return 0;
    }
  }

  static async sendTaskReminders() {
    try {
      const result = await query(
        `SELECT t.id, t.title, t.user_id, u.email, u.name as user_name
         FROM tasks t
         JOIN users u ON t.user_id = u.id
         WHERE t.completed = false
         AND t.due_date = CURRENT_DATE
         AND t.reminder_enabled = true`
      );

      logger.info(`Sending ${result.rows.length} task reminders`);
      
      result.rows.forEach(task => {
        logger.info(`Reminder for user ${task.user_id}: Complete task "${task.title}"`);
      });

      return result.rows.length;
    } catch (error) {
      logger.error('Error sending task reminders:', error);
      return 0;
    }
  }

  /**
   * Send custom notification to user
   */
  static async sendNotification(userId, title, message, type = 'info') {
    try {
      // Store notification in database or send via push service
      logger.info(`Notification to user ${userId}: ${title} - ${message}`);
      
      // Here you would integrate with Firebase Cloud Messaging or similar
      
      return true;
    } catch (error) {
      logger.error('Error sending notification:', error);
      return false;
    }
  }
}

module.exports = NotificationService;
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs').promises;
const Task = require('../models/Task');
const Expense = require('../models/Expense');
const Meal = require('../models/Meal');
const Workout = require('../models/Workout');
const logger = require('../utils/logger');

class ExportService {
  /**
   * Export user data to CSV
   */
  static async exportToCSV(userId, dataType, startDate, endDate) {
    try {
      const timestamp = Date.now();
      const filename = `${dataType}_export_${timestamp}.csv`;
      const filepath = path.join(process.env.UPLOAD_PATH || './uploads', filename);

      let data;
      let headers;

      switch (dataType) {
        case 'tasks':
          data = await Task.findByUserId(userId, { start_date: startDate, end_date: endDate });
          headers = [
            { id: 'id', title: 'ID' },
            { id: 'title', title: 'Title' },
            { id: 'description', title: 'Description' },
            { id: 'category', title: 'Category' },
            { id: 'priority', title: 'Priority' },
            { id: 'due_date', title: 'Due Date' },
            { id: 'completed', title: 'Completed' },
            { id: 'created_at', title: 'Created At' },
          ];
          break;

        case 'expenses':
          data = await Expense.findByUserId(userId, { start_date: startDate, end_date: endDate });
          headers = [
            { id: 'id', title: 'ID' },
            { id: 'amount', title: 'Amount' },
            { id: 'type', title: 'Type' },
            { id: 'category', title: 'Category' },
            { id: 'account', title: 'Account' },
            { id: 'notes', title: 'Notes' },
            { id: 'date', title: 'Date' },
          ];
          break;

        case 'meals':
          data = await Meal.findByUserId(userId, { start_date: startDate, end_date: endDate });
          headers = [
            { id: 'id', title: 'ID' },
            { id: 'food_name', title: 'Food Name' },
            { id: 'meal_type', title: 'Meal Type' },
            { id: 'calories', title: 'Calories' },
            { id: 'protein', title: 'Protein (g)' },
            { id: 'carbs', title: 'Carbs (g)' },
            { id: 'fat', title: 'Fat (g)' },
            { id: 'date', title: 'Date' },
          ];
          break;

        case 'workouts':
          data = await Workout.findByUserId(userId, { start_date: startDate, end_date: endDate });
          headers = [
            { id: 'id', title: 'ID' },
            { id: 'type', title: 'Type' },
            { id: 'name', title: 'Name' },
            { id: 'duration_minutes', title: 'Duration (min)' },
            { id: 'calories_burned', title: 'Calories Burned' },
            { id: 'distance_km', title: 'Distance (km)' },
            { id: 'date', title: 'Date' },
          ];
          break;

        default:
          throw new Error('Invalid data type');
      }

      const csvWriter = createObjectCsvWriter({
        path: filepath,
        header: headers,
      });

      await csvWriter.writeRecords(data);

      logger.info(`Exported ${dataType} data for user ${userId}: ${filename}`);

      return {
        filename,
        filepath,
        recordCount: data.length,
      };
    } catch (error) {
      logger.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Export all user data
   */
  static async exportAllData(userId, startDate, endDate) {
    const exports = await Promise.all([
      this.exportToCSV(userId, 'tasks', startDate, endDate),
      this.exportToCSV(userId, 'expenses', startDate, endDate),
      this.exportToCSV(userId, 'meals', startDate, endDate),
      this.exportToCSV(userId, 'workouts', startDate, endDate),
    ]);

    return exports;
  }

  /**
   * Clean up old export files
   */
  static async cleanupOldExports(maxAgeHours = 24) {
    try {
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      const files = await fs.readdir(uploadPath);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      let deletedCount = 0;

      for (const file of files) {
        if (file.includes('_export_')) {
          const filepath = path.join(uploadPath, file);
          const stats = await fs.stat(filepath);
          const age = now - stats.mtimeMs;

          if (age > maxAge) {
            await fs.unlink(filepath);
            deletedCount++;
          }
        }
      }

      logger.info(`Cleaned up ${deletedCount} old export files`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up exports:', error);
      return 0;
    }
  }
}

module.exports = ExportService;
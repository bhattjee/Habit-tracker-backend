const { query } = require('../config/database');

class StreakService {
  /**
   * Calculate current streak for any date-based entity
   */
  static async calculateStreak(tableName, entityIdColumn, entityId, dateColumn = 'date', completionColumn = 'completed') {
    const result = await query(
      `WITH RECURSIVE date_check AS (
        SELECT CURRENT_DATE as check_date, 0 as streak
        UNION ALL
        SELECT check_date - INTERVAL '1 day', streak + 1
        FROM date_check
        WHERE check_date > CURRENT_DATE - INTERVAL '365 days'
        AND EXISTS (
          SELECT 1 FROM ${tableName}
          WHERE ${entityIdColumn} = $1
          AND ${dateColumn} = (check_date - INTERVAL '1 day')::date
          AND ${completionColumn} = true
        )
      )
      SELECT MAX(streak) as current_streak FROM date_check`,
      [entityId]
    );
    
    return result.rows[0]?.current_streak || 0;
  }

  /**
   * Calculate longest streak ever
   */
  static async calculateLongestStreak(tableName, entityIdColumn, entityId, dateColumn = 'date', completionColumn = 'completed') {
    const result = await query(
      `WITH dates AS (
        SELECT ${dateColumn} as date,
               ${dateColumn}::date - ROW_NUMBER() OVER (ORDER BY ${dateColumn})::integer AS grp
        FROM ${tableName}
        WHERE ${entityIdColumn} = $1 AND ${completionColumn} = true
      )
      SELECT COALESCE(MAX(count), 0) as longest_streak
      FROM (
        SELECT COUNT(*) as count
        FROM dates
        GROUP BY grp
      ) sub`,
      [entityId]
    );
    
    return result.rows[0]?.longest_streak || 0;
  }

  /**
   * Get streak stats for multiple entities
   */
  static async getBatchStreaks(tableName, entityIdColumn, entityIds, dateColumn = 'date', completionColumn = 'completed') {
    const results = await Promise.all(
      entityIds.map(async (id) => ({
        id,
        currentStreak: await this.calculateStreak(tableName, entityIdColumn, id, dateColumn, completionColumn),
        longestStreak: await this.calculateLongestStreak(tableName, entityIdColumn, id, dateColumn, completionColumn),
      }))
    );
    
    return results;
  }
}

module.exports = StreakService;
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { User, CreateUserRequest, LoginRequest } from '../types';
import { ConflictError, NotFoundError, UnauthorizedError } from '../middleware/errorHandler';

export class UserService {
  // Create new user
  async createUser(userData: CreateUserRequest): Promise<User> {
    const client = await pool.connect();
    
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUser.rows.length > 0) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Insert new user
      const result = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, first_name, last_name, phone, created_at, updated_at`,
        [
          userData.email,
          passwordHash,
          userData.first_name || null,
          userData.last_name || null,
          userData.phone || null
        ]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Authenticate user
  async authenticateUser(loginData: LoginRequest): Promise<User> {
    const client = await pool.connect();
    
    try {
      // Find user by email
      const result = await client.query(
        'SELECT id, email, password_hash, first_name, last_name, phone, created_at, updated_at FROM users WHERE email = $1',
        [loginData.email]
      );

      if (result.rows.length === 0) {
        throw new UnauthorizedError('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } finally {
      client.release();
    }
  }

  // Get user by ID
  async getUserById(userId: number): Promise<User | null> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, email, first_name, last_name, phone, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, email, first_name, last_name, phone, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  // Update user profile
  async updateUser(userId: number, updateData: Partial<User>): Promise<User> {
    const client = await pool.connect();
    
    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [userId]
      );

      if (existingUser.rows.length === 0) {
        throw new NotFoundError('User not found');
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (updateData.first_name !== undefined) {
        updateFields.push(`first_name = $${paramIndex++}`);
        updateValues.push(updateData.first_name);
      }

      if (updateData.last_name !== undefined) {
        updateFields.push(`last_name = $${paramIndex++}`);
        updateValues.push(updateData.last_name);
      }

      if (updateData.phone !== undefined) {
        updateFields.push(`phone = $${paramIndex++}`);
        updateValues.push(updateData.phone);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      // Add updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(userId);

      const result = await client.query(
        `UPDATE users 
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, email, first_name, last_name, phone, created_at, updated_at`,
        updateValues
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Change user password
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const client = await pool.connect();
    
    try {
      // Get current password hash
      const result = await client.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('User not found');
      }

      const currentPasswordHash = result.rows[0].password_hash;

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, userId]
      );
    } finally {
      client.release();
    }
  }

  // Delete user account
  async deleteUser(userId: number): Promise<void> {
    const client = await pool.connect();
    
    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [userId]
      );

      if (existingUser.rows.length === 0) {
        throw new NotFoundError('User not found');
      }

      // Delete user (in production, you might want to soft delete)
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
    } finally {
      client.release();
    }
  }

  // Get user search history
  async getUserSearchHistory(userId: number, limit: number = 10): Promise<any[]> {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT * FROM search_history 
         WHERE user_id = $1 
         ORDER BY search_date DESC 
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  // Save search to history
  async saveSearchToHistory(userId: number, searchData: any): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query(
        `INSERT INTO search_history 
         (user_id, from_location, to_location, departure_date, return_date, 
          passengers_count, transport_type, trip_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          searchData.from_location,
          searchData.to_location,
          searchData.departure_date,
          searchData.return_date || null,
          searchData.passengers_count,
          searchData.transport_type,
          searchData.trip_type
        ]
      );
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const userService = new UserService();
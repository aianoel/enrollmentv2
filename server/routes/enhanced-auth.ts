import { Router } from 'express';
import { z } from 'zod';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, comparePassword, checkRateLimit, clearRateLimit, hashPassword } from '../auth/jwt';
import { storage } from '../unified-storage';

const router = Router();

// Enhanced login with JWT and rate limiting
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // Rate limiting check
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ 
        error: 'Too many login attempts. Please try again later.' 
      });
    }

    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Clear rate limit on successful login
    clearRateLimit(clientIp);

    // Generate tokens
    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      roleId: user.roleId
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Update last login
    await storage.updateUserLastLogin(user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        isActive: user.isActive
      },
      accessToken,
      refreshToken,
      expiresIn: '15m'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Token refresh endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    // Verify user still exists and is active
    const user = await storage.getUserById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    // Generate new access token
    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      roleId: user.roleId
    };

    const newAccessToken = generateAccessToken(userPayload);

    res.json({
      accessToken: newAccessToken,
      expiresIn: '15m'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Enhanced logout with token invalidation
router.post('/logout', async (req, res) => {
  try {
    // In a full implementation, you'd add the token to a blacklist
    // For now, we'll just respond with success
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password endpoint
const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

router.patch('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password
    await storage.updateUserPassword(userId, newPasswordHash);

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
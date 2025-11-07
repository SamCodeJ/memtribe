import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register new user
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, full_name } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(400).json({ error: 'User already exists with this email' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      full_name,
      role: 'user',
      subscription_plan: 'starter'
    },
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      subscription_plan: true,
      created_at: true
    }
  });

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    message: 'User registered successfully',
    user,
    token
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate token
  const token = generateToken(user.id);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    message: 'Login successful',
    user: userWithoutPassword,
    token
  });
});

/**
 * Get current user
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    user: req.user
  });
});

/**
 * Refresh token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // Verify old token (even if expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        subscription_plan: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new token
    const newToken = generateToken(user.id);

    res.json({
      token: newToken,
      user
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * Update current user
 */
export const updateCurrentUser = asyncHandler(async (req, res) => {
  const { full_name, subscription_plan } = req.body;

  // Build update data
  const updateData = {};
  if (full_name !== undefined) updateData.full_name = full_name;
  if (subscription_plan !== undefined) updateData.subscription_plan = subscription_plan;

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      subscription_plan: true,
      created_at: true
    }
  });

  res.json({
    message: 'User updated successfully',
    user: updatedUser
  });
});

/**
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      subscription_plan: true,
      created_at: true
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  res.json(users);
});

/**
 * Get user by ID (public info only)
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      full_name: true,
      role: true,
      subscription_plan: true,
      created_at: true
      // Note: email is excluded for privacy unless requested by admin
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

/**
 * Update user by ID (admin only)
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { full_name, role, subscription_plan } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });

  if (!existingUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Build update data
  const updateData = {};
  if (full_name !== undefined) updateData.full_name = full_name;
  if (role !== undefined) updateData.role = role;
  if (subscription_plan !== undefined) updateData.subscription_plan = subscription_plan;

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      subscription_plan: true,
      created_at: true
    }
  });

  res.json({
    message: 'User updated successfully',
    user: updatedUser
  });
});

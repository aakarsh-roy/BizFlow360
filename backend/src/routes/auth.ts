import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

// Generate JWT Token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ userId: id }, secret, {
    expiresIn: '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Trim and lowercase email
    const trimmedEmail = email?.trim().toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: trimmedEmail,
      password,
      role,
      department
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trim whitespace from email
    const trimmedEmail = email?.trim().toLowerCase();
    
    console.log(`🔐 Login attempt for email: ${email} (trimmed: ${trimmedEmail})`);

    // Validate email & password
    if (!trimmedEmail || !password) {
      console.log(`❌ Login failed: Missing email or password`);
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    console.log(`🔍 Looking up user: ${trimmedEmail}`);
    const user = await User.findOne({ email: trimmedEmail }).select('+password');
    if (!user) {
      console.log(`❌ Login failed: User not found for email: ${trimmedEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`👤 User found: ${user.name} (${user.email}) - Role: ${user.role}`);

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`❌ Login failed: Invalid password for ${trimmedEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`✅ Password verified for ${email}`);
    const token = generateToken(user._id.toString());
    console.log(`🎫 JWT token generated for user: ${user._id}`);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
    
    console.log(`✅ Login successful for ${email} - Token sent`);
  } catch (error: any) {
    console.error(`❌ Login error:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

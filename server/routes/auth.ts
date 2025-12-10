import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, userType, firstName, lastName, companyName } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (userType === 'brand') {
      // Check if brand manager exists
      const existing = await prisma.brandManager.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const brandManager = await prisma.brandManager.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          companyName,
        },
      });

      const token = jwt.sign(
        { userId: brandManager.id, email, type: 'brand' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: brandManager.id,
          email,
          type: 'brand',
          firstName,
          lastName,
          companyName,
        },
      });
    } else {
      // Creator signup - requires claim token normally, but for demo allow direct signup
      const existing = await prisma.creator.findFirst({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const creator = await prisma.creator.create({
        data: {
          email,
          passwordHash,
          username: email.split('@')[0],
          platform: 'instagram',
          followerCount: 0,
          contentCategories: [],
          verificationStatus: 'pending',
        },
      });

      const token = jwt.sign(
        { userId: creator.id, email, type: 'creator' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: creator.id,
          email,
          type: 'creator',
          username: creator.username,
        },
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (userType === 'brand') {
      const brandManager = await prisma.brandManager.findUnique({ where: { email } });
      if (!brandManager) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, brandManager.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: brandManager.id, email, type: 'brand' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: brandManager.id,
          email,
          type: 'brand',
          firstName: brandManager.firstName,
          lastName: brandManager.lastName,
          companyName: brandManager.companyName,
        },
      });
    } else {
      const creator = await prisma.creator.findFirst({ where: { email } });
      if (!creator || !creator.passwordHash) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, creator.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: creator.id, email, type: 'creator' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: creator.id,
          email,
          type: 'creator',
          username: creator.username,
        },
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

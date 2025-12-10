import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Request type for admin auth
interface AdminRequest extends Request {
  admin?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Admin auth middleware
const adminAuth = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      type: string;
      role: string;
    };

    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.admin = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================

// Admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = jwt.sign(
      { userId: admin.id, email: admin.email, type: 'admin', role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: 'admin',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ==================== ANALYTICS ROUTES ====================

// Get platform analytics
router.get('/analytics', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const [
      totalCreators,
      verifiedCreators,
      totalBrands,
      totalDeals,
      dealsByStatus,
      recentDeals,
    ] = await Promise.all([
      prisma.creator.count(),
      prisma.creator.count({ where: { verificationStatus: 'verified' } }),
      prisma.brandManager.count(),
      prisma.deal.count(),
      prisma.deal.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { dealAmount: true },
      }),
      prisma.deal.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { username: true, platform: true } },
          brandManager: { select: { companyName: true } },
        },
      }),
    ]);

    // Calculate GMV
    const totalGMV = dealsByStatus.reduce((sum, item) => sum + (item._sum.dealAmount || 0), 0);
    const completedGMV = dealsByStatus
      .filter((d) => ['completed', 'paid'].includes(d.status))
      .reduce((sum, item) => sum + (item._sum.dealAmount || 0), 0);

    // Status breakdown
    const statusBreakdown = dealsByStatus.reduce((acc, item) => {
      acc[item.status] = {
        count: item._count.status,
        totalAmount: item._sum.dealAmount || 0,
      };
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    return res.json({
      overview: {
        totalCreators,
        verifiedCreators,
        pendingVerification: totalCreators - verifiedCreators,
        totalBrands,
        totalDeals,
        totalGMV,
        completedGMV,
      },
      dealsByStatus: statusBreakdown,
      recentDeals: recentDeals.map((d) => ({
        id: d.id,
        amount: d.dealAmount,
        status: d.status,
        creatorUsername: d.creator.username,
        creatorPlatform: d.creator.platform,
        brandName: d.brandManager.companyName,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ==================== CREATORS ROUTES ====================

// Get all creators
router.get('/creators', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { status, platform, search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) where.verificationStatus = status;
    if (platform) where.platform = platform;
    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [creators, total] = await Promise.all([
      prisma.creator.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          platform: true,
          followerCount: true,
          engagementRate: true,
          verificationStatus: true,
          currentFeeTier: true,
          annualEarnings: true,
          createdAt: true,
          contentCategories: true,
          _count: { select: { deals: true } },
        },
      }),
      prisma.creator.count({ where }),
    ]);

    return res.json({
      creators: creators.map((c) => ({
        ...c,
        dealsCount: c._count.deals,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get creators error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update creator verification status
router.put('/creators/:id/verification', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const creator = await prisma.creator.update({
      where: { id },
      data: { verificationStatus: status },
    });

    return res.json({ message: 'Verification status updated', creator });
  } catch (error) {
    console.error('Update verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update creator fee tier
router.put('/creators/:id/tier', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;

    if (!['launch', 'growth', 'scale', 'partner'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid tier' });
    }

    const creator = await prisma.creator.update({
      where: { id },
      data: { currentFeeTier: tier },
    });

    return res.json({ message: 'Fee tier updated', creator });
  } catch (error) {
    console.error('Update tier error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ==================== BRANDS ROUTES ====================

// Get all brands
router.get('/brands', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { companyName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [brands, total] = await Promise.all([
      prisma.brandManager.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
          industry: true,
          createdAt: true,
          _count: { select: { deals: true } },
        },
      }),
      prisma.brandManager.count({ where }),
    ]);

    // Get total spend per brand
    const brandIds = brands.map((b) => b.id);
    const dealSums = await prisma.deal.groupBy({
      by: ['brandManagerId'],
      where: { brandManagerId: { in: brandIds } },
      _sum: { dealAmount: true },
    });

    const spendMap = dealSums.reduce((acc, item) => {
      acc[item.brandManagerId] = item._sum.dealAmount || 0;
      return acc;
    }, {} as Record<string, number>);

    return res.json({
      brands: brands.map((b) => ({
        ...b,
        dealsCount: b._count.deals,
        totalSpend: spendMap[b.id] || 0,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get brands error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ==================== DEALS ROUTES ====================

// Get all deals
router.get('/deals', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, username: true, platform: true, email: true },
          },
          brandManager: {
            select: { id: true, companyName: true, email: true },
          },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    return res.json({
      deals: deals.map((d) => ({
        id: d.id,
        dealAmount: d.dealAmount,
        platformFee: d.platformFee,
        platformFeeAmount: d.platformFeeAmount,
        status: d.status,
        deliverables: d.deliverables,
        dealDescription: d.dealDescription,
        createdAt: d.createdAt,
        completedAt: d.completedAt,
        creator: d.creator,
        brand: d.brandManager,
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get deals error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update deal status
router.put('/deals/:id/status', adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'in_progress', 'completed', 'paid', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        status,
        completedAt: ['completed', 'paid'].includes(status) ? new Date() : undefined,
      },
    });

    return res.json({ message: 'Deal status updated', deal });
  } catch (error) {
    console.error('Update deal status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

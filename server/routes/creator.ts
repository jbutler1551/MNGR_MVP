import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth.js';

const router = Router();

// Claim creator profile
router.post('/claim', async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const creator = await prisma.creator.findFirst({
      where: {
        claimToken: token,
        claimTokenExpiry: { gte: new Date() },
      },
    });

    if (!creator) {
      return res.status(400).json({ message: 'Invalid or expired claim token' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        email,
        passwordHash,
        claimToken: null,
        claimTokenExpiry: null,
        verificationStatus: 'verified',
      },
    });

    res.json({ message: 'Profile claimed successfully' });
  } catch (error) {
    console.error('Claim error:', error);
    res.status(500).json({ message: 'Failed to claim profile' });
  }
});

// Get creator deals
router.get('/deals', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.type !== 'creator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const deals = await prisma.deal.findMany({
      where: { creatorId: user.userId },
      include: {
        brandManager: {
          select: {
            companyName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedDeals = deals.map((deal) => ({
      id: deal.id,
      brandCompanyName: deal.brandManager.companyName || `${deal.brandManager.firstName} ${deal.brandManager.lastName}`,
      dealAmount: deal.dealAmount,
      platformFee: deal.platformFee,
      platformFeeAmount: deal.platformFeeAmount,
      status: deal.status,
      createdAt: deal.createdAt,
      dueDate: deal.dueDate,
      completedAt: deal.completedAt,
      deliverables: deal.deliverables,
      dealDescription: deal.dealDescription,
      usageRights: deal.usageRights,
      exclusivity: deal.exclusivity,
      brandApproval: deal.brandApproval,
      revisionRounds: deal.revisionRounds,
      deliveryWindow: deal.deliveryWindow,
      customDeliveryDays: deal.customDeliveryDays,
      briefText: deal.briefText,
    }));

    res.json(formattedDeals);
  } catch (error) {
    console.error('Get creator deals error:', error);
    res.status(500).json({ message: 'Failed to get deals' });
  }
});

// Update deal status (accept, reject, mark in_progress, complete)
router.put('/deals/:dealId/status', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const { dealId } = req.params;
    const { status } = req.body;

    if (user.type !== 'creator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate status
    const validStatuses = ['accepted', 'rejected', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the deal and verify ownership
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (deal.creatorId !== user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this deal' });
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['accepted', 'rejected'],
      accepted: ['in_progress', 'rejected'],
      in_progress: ['completed'],
      completed: [], // Can't change after completed (brand pays)
      paid: [],
      cancelled: [],
    };

    if (!validTransitions[deal.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${deal.status} to ${status}`,
      });
    }

    // Update the deal
    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
    });

    res.json(updatedDeal);
  } catch (error) {
    console.error('Update deal status error:', error);
    res.status(500).json({ message: 'Failed to update deal status' });
  }
});

// Get creator stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.type !== 'creator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: user.userId },
    });

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    const deals = await prisma.deal.findMany({
      where: { creatorId: user.userId },
    });

    const pendingDeals = deals.filter((d) => d.status === 'pending').length;
    const completedDeals = deals.filter((d) => ['completed', 'paid'].includes(d.status)).length;
    const totalEarnings = deals
      .filter((d) => d.status === 'paid')
      .reduce((sum, d) => sum + d.dealAmount, 0);

    // Calculate tier progress
    let tierProgress = 0;
    const earnings = creator.annualEarnings;
    if (earnings < 10000) tierProgress = (earnings / 10000) * 25;
    else if (earnings < 50000) tierProgress = 25 + ((earnings - 10000) / 40000) * 25;
    else if (earnings < 100000) tierProgress = 50 + ((earnings - 50000) / 50000) * 25;
    else tierProgress = 100;

    res.json({
      totalEarnings,
      pendingDeals,
      completedDeals,
      currentTier: creator.currentFeeTier,
      tierProgress: Math.round(tierProgress),
    });
  } catch (error) {
    console.error('Get creator stats error:', error);
    res.status(500).json({ message: 'Failed to get stats' });
  }
});

// Get creator profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.type !== 'creator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: user.userId },
      select: {
        username: true,
        email: true,
        platform: true,
        followerCount: true,
        engagementRate: true,
        contentCategories: true,
        minimumDealAmount: true,
        profileCompletion: true,
        currentFeeTier: true,
        annualEarnings: true,
      },
    });

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    res.json(creator);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update creator profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.type !== 'creator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { minimumDealAmount, contentCategories } = req.body;

    const creator = await prisma.creator.update({
      where: { id: user.userId },
      data: {
        minimumDealAmount,
        contentCategories,
        profileCompletion: calculateProfileCompletion(req.body),
      },
    });

    res.json(creator);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

function calculateProfileCompletion(data: any): number {
  let score = 0;
  if (data.minimumDealAmount) score += 25;
  if (data.contentCategories?.length > 0) score += 25;
  // Add more fields as needed
  return Math.min(score + 50, 100); // Base 50% for having an account
}

export default router;

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth.js';

const router = Router();

// Get deals for brand manager
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.type !== 'brand') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const deals = await prisma.deal.findMany({
      where: { brandManagerId: user.userId },
      include: {
        creator: {
          select: {
            username: true,
            platform: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedDeals = deals.map((deal) => ({
      id: deal.id,
      creatorUsername: deal.creator.username,
      dealAmount: deal.dealAmount,
      status: deal.status,
      createdAt: deal.createdAt,
    }));

    res.json(formattedDeals);
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ message: 'Failed to get deals' });
  }
});

// Create deal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.type !== 'brand') {
      return res.status(403).json({ message: 'Only brands can create deals' });
    }

    const {
      creatorId,
      dealAmount,
      dealDescription,
      deliverables,
      dueDate,
      usageRights,
      exclusivity,
      revisionRounds,
      deliveryWindow,
      briefText,
    } = req.body;

    if (!creatorId || !dealAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get creator to calculate fee
    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    // Calculate platform fee based on tier
    const feeRates: Record<string, number> = {
      launch: 0.18,
      growth: 0.15,
      scale: 0.12,
      partner: 0.10,
    };
    const feeRate = feeRates[creator.currentFeeTier] || 0.18;
    const platformFeeAmount = dealAmount * feeRate;

    const deal = await prisma.deal.create({
      data: {
        creatorId,
        brandManagerId: user.userId,
        dealAmount,
        platformFee: feeRate * 100, // Store as percentage
        platformFeeAmount,
        dealDescription,
        deliverables: deliverables || [],
        dueDate: dueDate ? new Date(dueDate) : null,
        usageRights,
        exclusivity: typeof exclusivity === 'string' ? exclusivity : 'none',
        revisionRounds: revisionRounds || 2,
        deliveryWindow,
        briefText,
        status: 'pending',
      },
    });

    res.json(deal);
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ message: 'Failed to create deal' });
  }
});

// Update deal status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    const deal = await prisma.deal.findUnique({ where: { id } });

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Verify user has access
    if (user.type === 'brand' && deal.brandManagerId !== user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (user.type === 'creator' && deal.creatorId !== user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Brand-specific status transitions
    if (user.type === 'brand') {
      // Brand can only cancel pending deals
      if (status === 'cancelled' && deal.status !== 'pending') {
        return res.status(400).json({ message: 'Can only cancel pending deals' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({ message: 'Brands can only cancel deals' });
      }
    }

    // Creator-specific status transitions handled in /api/creator/deals/:id/status

    const updatedDeal = await prisma.deal.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
    });

    // Update creator earnings if deal is paid
    if (status === 'paid') {
      const creator = await prisma.creator.findUnique({
        where: { id: deal.creatorId },
      });

      if (creator) {
        const newEarnings = creator.annualEarnings + deal.dealAmount;

        // Determine new tier
        let newTier = 'launch';
        if (newEarnings >= 100000) newTier = 'partner';
        else if (newEarnings >= 50000) newTier = 'scale';
        else if (newEarnings >= 10000) newTier = 'growth';

        await prisma.creator.update({
          where: { id: deal.creatorId },
          data: {
            annualEarnings: newEarnings,
            currentFeeTier: newTier,
          },
        });
      }
    }

    res.json(updatedDeal);
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ message: 'Failed to update deal' });
  }
});

export default router;

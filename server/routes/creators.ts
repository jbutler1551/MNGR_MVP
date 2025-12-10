import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth.js';

const router = Router();

// Search creators
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    const query = (q as string) || '';

    // Parse the natural language query (simplified version)
    const parsedIntent = parseSearchQuery(query);

    // Build where clause
    const where: any = {};

    if (parsedIntent.platform) {
      where.platform = parsedIntent.platform.toLowerCase();
    }

    if (parsedIntent.minFollowers || parsedIntent.maxFollowers) {
      where.followerCount = {};
      if (parsedIntent.minFollowers) {
        where.followerCount.gte = parsedIntent.minFollowers;
      }
      if (parsedIntent.maxFollowers) {
        where.followerCount.lte = parsedIntent.maxFollowers;
      }
    }

    if (parsedIntent.niche) {
      where.contentCategories = {
        hasSome: [parsedIntent.niche],
      };
    }

    // Get creators
    const creators = await prisma.creator.findMany({
      where,
      take: 20,
      orderBy: { followerCount: 'desc' },
      select: {
        id: true,
        username: true,
        platform: true,
        followerCount: true,
        engagementRate: true,
        contentCategories: true,
      },
    });

    // Add match scores (simplified)
    const creatorsWithScores = creators.map((creator) => ({
      ...creator,
      matchScore: calculateMatchScore(creator, parsedIntent),
    }));

    // Sort by match score
    creatorsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    // Log search query
    if ((req as any).user) {
      await prisma.searchQuery.create({
        data: {
          brandManagerId: (req as any).user.userId,
          queryText: query,
          parsedIntent,
          resultsCount: creators.length,
        },
      });
    }

    res.json({
      creators: creatorsWithScores,
      parsedIntent,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Get creator by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        platform: true,
        followerCount: true,
        engagementRate: true,
        avgViews: true,
        contentCategories: true,
        audienceDemographics: true,
        verificationStatus: true,
        minimumDealAmount: true,
      },
    });

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    res.json(creator);
  } catch (error) {
    console.error('Get creator error:', error);
    res.status(500).json({ message: 'Failed to get creator' });
  }
});

// Parse natural language search query
function parseSearchQuery(query: string) {
  const intent: {
    niche?: string;
    minFollowers?: number;
    maxFollowers?: number;
    platform?: string;
  } = {};

  const q = query.toLowerCase();

  // Extract platform
  if (q.includes('instagram')) intent.platform = 'instagram';
  else if (q.includes('tiktok')) intent.platform = 'tiktok';
  else if (q.includes('youtube')) intent.platform = 'youtube';

  // Extract follower counts
  const followerMatch = q.match(/(\d+)k?\s*[-–]\s*(\d+)k?\s*(followers?)?/i);
  if (followerMatch) {
    intent.minFollowers = parseInt(followerMatch[1]) * (q.includes('k') ? 1000 : 1);
    intent.maxFollowers = parseInt(followerMatch[2]) * (q.includes('k') ? 1000 : 1);
  }

  const minMatch = q.match(/(\d+)k?\+\s*(followers?)?/i);
  if (minMatch) {
    intent.minFollowers = parseInt(minMatch[1]) * 1000;
  }

  // Extract niche
  const niches = ['fitness', 'beauty', 'fashion', 'food', 'travel', 'tech', 'gaming', 'lifestyle', 'parenting', 'business'];
  for (const niche of niches) {
    if (q.includes(niche)) {
      intent.niche = niche.charAt(0).toUpperCase() + niche.slice(1);
      break;
    }
  }

  return intent;
}

// Calculate match score
function calculateMatchScore(
  creator: any,
  intent: { niche?: string; minFollowers?: number; maxFollowers?: number; platform?: string }
) {
  let score = 50; // Base score

  // Platform match
  if (intent.platform && creator.platform === intent.platform) {
    score += 15;
  }

  // Follower range match
  if (intent.minFollowers && intent.maxFollowers) {
    if (creator.followerCount >= intent.minFollowers && creator.followerCount <= intent.maxFollowers) {
      score += 20;
    }
  } else if (intent.minFollowers && creator.followerCount >= intent.minFollowers) {
    score += 15;
  }

  // Niche match
  if (intent.niche && creator.contentCategories?.includes(intent.niche)) {
    score += 20;
  }

  // Engagement bonus
  if (creator.engagementRate) {
    if (creator.engagementRate > 5) score += 10;
    else if (creator.engagementRate > 3) score += 5;
  }

  return Math.min(score, 100);
}

export default router;

import { Router, Request, Response } from 'express';
import { stripe, calculatePlatformFee, calculateCreatorPayout } from '../lib/stripe.js';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';

// Auth middleware
interface AuthRequest extends Request {
  user?: { userId: string; email: string; type: string };
}

const authMiddleware = (req: AuthRequest, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; type: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ==================== STRIPE CONNECT (CREATOR ONBOARDING) ====================

// Create Stripe Connect account for creator
router.post('/connect/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.type !== 'creator') {
      return res.status(403).json({ message: 'Only creators can connect Stripe accounts' });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: req.user.userId },
    });

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    // Check if already has Stripe account
    if (creator.stripeAccountId) {
      return res.status(400).json({
        message: 'Stripe account already connected',
        accountId: creator.stripeAccountId
      });
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: creator.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        creatorId: creator.id,
        platform: 'mngr',
      },
    });

    // Save Stripe account ID to creator
    await prisma.creator.update({
      where: { id: creator.id },
      data: { stripeAccountId: account.id },
    });

    return res.json({
      accountId: account.id,
      message: 'Stripe account created'
    });
  } catch (error: any) {
    console.error('Stripe Connect create error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create Stripe account' });
  }
});

// Get Stripe Connect onboarding link
router.post('/connect/onboarding', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.type !== 'creator') {
      return res.status(403).json({ message: 'Only creators can access Stripe onboarding' });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: req.user.userId },
    });

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    let accountId = creator.stripeAccountId;

    // Create account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: creator.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          creatorId: creator.id,
          platform: 'mngr',
        },
      });

      accountId = account.id;

      await prisma.creator.update({
        where: { id: creator.id },
        data: { stripeAccountId: accountId },
      });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${FRONTEND_URL}/creator/settings?stripe=refresh`,
      return_url: `${FRONTEND_URL}/creator/settings?stripe=success`,
      type: 'account_onboarding',
    });

    return res.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Stripe onboarding error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create onboarding link' });
  }
});

// Get Stripe Connect dashboard link (for existing connected accounts)
router.get('/connect/dashboard', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.type !== 'creator') {
      return res.status(403).json({ message: 'Only creators can access Stripe dashboard' });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: req.user.userId },
    });

    if (!creator?.stripeAccountId) {
      return res.status(400).json({ message: 'No Stripe account connected' });
    }

    const loginLink = await stripe.accounts.createLoginLink(creator.stripeAccountId);

    return res.json({ url: loginLink.url });
  } catch (error: any) {
    console.error('Stripe dashboard error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create dashboard link' });
  }
});

// Check Stripe Connect account status
router.get('/connect/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.type !== 'creator') {
      return res.status(403).json({ message: 'Only creators can check Stripe status' });
    }

    const creator = await prisma.creator.findUnique({
      where: { id: req.user.userId },
    });

    if (!creator?.stripeAccountId) {
      return res.json({
        connected: false,
        status: 'not_connected',
        message: 'No Stripe account connected'
      });
    }

    const account = await stripe.accounts.retrieve(creator.stripeAccountId);

    return res.json({
      connected: true,
      status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      accountId: creator.stripeAccountId,
    });
  } catch (error: any) {
    console.error('Stripe status error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get account status' });
  }
});

// ==================== PAYMENT INTENT (BRAND PAYS FOR DEAL) ====================

// Create payment intent for a deal
router.post('/intent/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.type !== 'brand') {
      return res.status(403).json({ message: 'Only brands can create payment intents' });
    }

    const { dealId } = req.body;

    if (!dealId) {
      return res.status(400).json({ message: 'Deal ID required' });
    }

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        creator: true,
        brandManager: true,
      },
    });

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (deal.brandManagerId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to pay for this deal' });
    }

    if (deal.status !== 'completed') {
      return res.status(400).json({ message: 'Deal must be completed before payment' });
    }

    if (deal.stripePaymentIntentId) {
      // Return existing payment intent
      const existingIntent = await stripe.paymentIntents.retrieve(deal.stripePaymentIntentId);
      return res.json({
        clientSecret: existingIntent.client_secret,
        paymentIntentId: existingIntent.id,
        amount: deal.dealAmount,
        status: existingIntent.status,
      });
    }

    // Check if creator has connected Stripe
    if (!deal.creator.stripeAccountId) {
      return res.status(400).json({
        message: 'Creator has not connected their payment account yet',
        creatorConnected: false
      });
    }

    // Calculate amounts (in cents for Stripe)
    const amountInCents = Math.round(deal.dealAmount * 100);
    const platformFeeInCents = Math.round((deal.platformFeeAmount || 0) * 100);

    // Create payment intent with application fee for platform
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      // Transfer to creator's connected account minus our fee
      transfer_data: {
        destination: deal.creator.stripeAccountId,
      },
      // Platform takes its fee
      application_fee_amount: platformFeeInCents,
      metadata: {
        dealId: deal.id,
        creatorId: deal.creatorId,
        brandId: deal.brandManagerId,
        platform: 'mngr',
      },
      description: `Deal payment: ${deal.deliverables.join(', ')}`,
    });

    // Save payment intent ID to deal
    await prisma.deal.update({
      where: { id: deal.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: deal.dealAmount,
      platformFee: deal.platformFeeAmount,
      creatorPayout: deal.dealAmount - (deal.platformFeeAmount || 0),
    });
  } catch (error: any) {
    console.error('Payment intent error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create payment' });
  }
});

// Get payment status for a deal
router.get('/status/:dealId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { dealId } = req.params;

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { creator: true },
    });

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Verify user is brand or creator for this deal
    if (deal.brandManagerId !== req.user?.userId && deal.creatorId !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to view this deal' });
    }

    if (!deal.stripePaymentIntentId) {
      return res.json({
        status: 'not_started',
        message: 'Payment not initiated',
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(deal.stripePaymentIntentId);

    return res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      creatorPayout: (paymentIntent.amount - (paymentIntent.application_fee_amount || 0)) / 100,
      platformFee: (paymentIntent.application_fee_amount || 0) / 100,
      createdAt: new Date(paymentIntent.created * 1000),
    });
  } catch (error: any) {
    console.error('Payment status error:', error);
    return res.status(500).json({ message: error.message || 'Failed to get payment status' });
  }
});

// ==================== STRIPE CONFIG (PUBLIC) ====================

// Get Stripe publishable key for frontend
router.get('/config', (req: Request, res: Response) => {
  return res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  });
});

export default router;

import { Router, Request, Response } from 'express';
import { stripe } from '../lib/stripe.js';
import { prisma } from '../lib/prisma.js';
import Stripe from 'stripe';

const router = Router();

// Stripe webhook handler
// Note: This route needs raw body, configured in server/index.ts
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing stripe signature or webhook secret');
    return res.status(400).json({ message: 'Missing signature' });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body, // Must be raw body
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  console.log(`Stripe webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// ==================== WEBHOOK HANDLERS ====================

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  const dealId = paymentIntent.metadata?.dealId;
  if (!dealId) {
    console.error('No dealId in payment intent metadata');
    return;
  }

  // Update deal status to 'paid'
  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: {
      status: 'paid',
      completedAt: new Date(),
    },
    include: { creator: true },
  });

  console.log(`Deal ${dealId} marked as paid`);

  // Update creator earnings
  const creatorPayout = (paymentIntent.amount - (paymentIntent.application_fee_amount || 0)) / 100;

  await prisma.creator.update({
    where: { id: deal.creatorId },
    data: {
      annualEarnings: {
        increment: creatorPayout,
      },
    },
  });

  console.log(`Creator ${deal.creatorId} earnings updated: +$${creatorPayout}`);

  // Check if creator should be upgraded to new tier
  const creator = await prisma.creator.findUnique({
    where: { id: deal.creatorId },
  });

  if (creator) {
    let newTier = creator.currentFeeTier;
    const earnings = creator.annualEarnings;

    if (earnings >= 100000) {
      newTier = 'partner';
    } else if (earnings >= 50000) {
      newTier = 'scale';
    } else if (earnings >= 10000) {
      newTier = 'growth';
    } else {
      newTier = 'launch';
    }

    if (newTier !== creator.currentFeeTier) {
      await prisma.creator.update({
        where: { id: creator.id },
        data: { currentFeeTier: newTier },
      });
      console.log(`Creator ${creator.id} upgraded to tier: ${newTier}`);
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  const dealId = paymentIntent.metadata?.dealId;
  if (!dealId) {
    console.error('No dealId in payment intent metadata');
    return;
  }

  // Log the failure but don't change deal status
  // Brand can retry payment
  console.log(`Payment failed for deal ${dealId}: ${paymentIntent.last_payment_error?.message}`);
}

async function handleAccountUpdated(account: Stripe.Account) {
  console.log('Account updated:', account.id);

  // Find creator with this Stripe account
  const creator = await prisma.creator.findFirst({
    where: { stripeAccountId: account.id },
  });

  if (!creator) {
    console.log('No creator found for Stripe account:', account.id);
    return;
  }

  // Log account status changes
  console.log(`Creator ${creator.id} Stripe account status:`, {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  });
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  console.log('Transfer created:', transfer.id);
  // Log transfer to creator's connected account
  console.log(`Transfer of $${transfer.amount / 100} to ${transfer.destination}`);
}

async function handlePayoutPaid(payout: Stripe.Payout) {
  console.log('Payout completed:', payout.id);
  // This is when money actually lands in creator's bank
  console.log(`Payout of $${payout.amount / 100} completed`);
}

export default router;

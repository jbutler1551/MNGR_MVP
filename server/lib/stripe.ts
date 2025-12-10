import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Payment features will not work.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Platform fee percentages by tier
export const PLATFORM_FEES: Record<string, number> = {
  launch: 18,   // 18% for $0-$10K earnings
  growth: 15,   // 15% for $10K-$50K earnings
  scale: 12,    // 12% for $50K-$100K earnings
  partner: 10,  // 10% for $100K+ earnings
};

// Calculate platform fee amount
export function calculatePlatformFee(amount: number, tier: string): number {
  const feePercent = PLATFORM_FEES[tier] || PLATFORM_FEES.launch;
  return Math.round(amount * (feePercent / 100) * 100) / 100;
}

// Calculate creator payout (deal amount - platform fee)
export function calculateCreatorPayout(dealAmount: number, platformFeeAmount: number): number {
  return Math.round((dealAmount - platformFeeAmount) * 100) / 100;
}

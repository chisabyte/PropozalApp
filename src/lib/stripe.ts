import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
  })
  : null

// Plan definitions - source of truth for quotas and features
export type PlanType = 'free' | 'starter' | 'pro'

export const PLANS = {
  free: {
    name: 'Free',
    priceIdMonthly: null,
    priceIdYearly: null,
    priceMonthly: 0,
    priceYearly: 0,
    proposalsPerMonth: 3,
    features: {
      publicShareLinks: false,
      viewTracking: false,
      analytics: false,
      pdfExport: false,
    },
  },
  starter: {
    name: 'Starter',
    priceIdMonthly: process.env.STRIPE_STARTER_PRICE_ID_MONTHLY || '',
    priceIdYearly: process.env.STRIPE_STARTER_PRICE_ID_YEARLY || '',
    priceMonthly: 19,
    priceYearly: 190,
    proposalsPerMonth: 100,
    features: {
      publicShareLinks: true,
      viewTracking: true,
      analytics: false,
      pdfExport: true,
    },
  },
  pro: {
    name: 'Pro',
    priceIdMonthly: process.env.STRIPE_PRO_PRICE_ID_MONTHLY || '',
    priceIdYearly: process.env.STRIPE_PRO_PRICE_ID_YEARLY || '',
    priceMonthly: 39,
    priceYearly: 390,
    proposalsPerMonth: 300,
    features: {
      publicShareLinks: true,
      viewTracking: true,
      analytics: true,
      pdfExport: true,
    },
  },
} as const

// Helper to get plan from Stripe price ID
export function getPlanFromPriceId(priceId: string): PlanType {
  if (priceId === PLANS.starter.priceIdMonthly || priceId === PLANS.starter.priceIdYearly) {
    return 'starter'
  }
  if (priceId === PLANS.pro.priceIdMonthly || priceId === PLANS.pro.priceIdYearly) {
    return 'pro'
  }
  return 'free'
}

// Helper to get quota for a plan
export function getPlanQuota(plan: PlanType): number {
  return PLANS[plan]?.proposalsPerMonth ?? 3
}

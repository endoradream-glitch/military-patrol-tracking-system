import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Initialize default subscription plans
const DEFAULT_PLANS = [
  {
    name: '72 hours-Pro Use',
    description: 'Free Tier - 3 days full access for trial',
    price: 0,
    durationDays: 3,
    features: JSON.stringify([
      'Full map tracking',
      'Real-time patrol monitoring',
      'SOS alerts',
      'Video/audio calls',
      'Location history',
      'Reports generation',
      'Up to 50 patrols',
      'Unlimited camps'
    ])
  },
  {
    name: 'Lets Walk',
    description: 'Limited Facilities - Perfect for small teams',
    price: 25,
    durationDays: 30,
    features: JSON.stringify([
      'Full map tracking',
      'Real-time patrol monitoring',
      'SOS alerts',
      'Audio calls only',
      'Location history (7 days)',
      'Basic reports',
      'Up to 20 patrols',
      'Up to 10 camps'
    ])
  },
  {
    name: 'Start jogging',
    description: 'Limited Facilities - For growing teams',
    price: 35,
    durationDays: 30,
    features: JSON.stringify([
      'Full map tracking',
      'Real-time patrol monitoring',
      'SOS alerts with routing',
      'Video/audio calls',
      'Location history (30 days)',
      'Advanced reports',
      'Up to 50 patrols',
      'Up to 25 camps',
      'Heatmap view',
      'Trail history'
    ])
  },
  {
    name: 'Sprint',
    description: 'Full Facilities - Complete solution',
    price: 56,
    durationDays: 30,
    features: JSON.stringify([
      'Full map tracking',
      'Real-time patrol monitoring',
      'SOS alerts with routing',
      'HD video/audio calls',
      'Unlimited location history',
      'Advanced analytics & reports',
      'Unlimited patrols',
      'Unlimited camps',
      'Heatmap view',
      'Trail history',
      'Offline mode support',
      'Priority support',
      'API access',
      'Custom branding'
    ])
  }
];

// GET - List all subscription plans
export async function GET() {
  try {
    // Ensure default plans exist
    const existingPlans = await db.subscriptionPlan.count();
    if (existingPlans === 0) {
      await db.subscriptionPlan.createMany({
        data: DEFAULT_PLANS
      });
    }

    const plans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    return NextResponse.json({
      success: true,
      plans: plans.map(plan => ({
        ...plan,
        features: JSON.parse(plan.features)
      }))
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST - Create new subscription plan (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, durationDays, features } = body;

    const plan = await db.subscriptionPlan.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        features: JSON.stringify(features || []),
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      plan: {
        ...plan,
        features: JSON.parse(plan.features)
      }
    });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}

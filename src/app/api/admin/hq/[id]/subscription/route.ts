import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Activate subscription for HQ
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await db.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Deactivate existing subscriptions
    await db.subscription.updateMany({
      where: {
        hqId: params.id,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // Create new subscription
    const subscription = await db.subscription.create({
      data: {
        hqId: params.id,
        planId: planId,
        startDate,
        endDate,
        isActive: true,
        warningSent: false
      },
      include: {
        plan: true
      }
    });

    return NextResponse.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Error activating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}

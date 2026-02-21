import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const hq = await db.hQ.findUnique({
      where: { code: params.code },
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          where: { isActive: true },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!hq) {
      return NextResponse.json(
        { success: false, error: 'HQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hq: {
        ...hq,
        currentSubscription: hq.subscriptions[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching HQ:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HQ' },
      { status: 500 }
    );
  }
}

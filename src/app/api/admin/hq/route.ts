import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all HQs
export async function GET() {
  try {
    const hqs = await db.hQ.findMany({
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        _count: {
          select: {
            patrols: true,
            camps: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      hqs: hqs.map(hq => ({
        ...hq,
        currentSubscription: hq.subscriptions[0] || null,
        patrolCount: hq._count.patrols,
        campCount: hq._count.camps
      }))
    });
  } catch (error) {
    console.error('Error fetching HQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HQs' },
      { status: 500 }
    );
  }
}

// POST - Create new HQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName, code, logoUrl, adminId } = body;

    // Validate input
    if (!name || !code || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if code is unique
    const existingHQ = await db.hQ.findUnique({
      where: { code }
    });

    if (existingHQ) {
      return NextResponse.json(
        { error: 'HQ code already exists' },
        { status: 409 }
      );
    }

    // Create HQ
    const hq = await db.hQ.create({
      data: {
        name: name.trim(),
        displayName: displayName?.trim() || name.trim(),
        code: code.trim(),
        logoUrl,
        createdBy: adminId,
        isApproved: false, // Requires approval
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      hq
    });
  } catch (error) {
    console.error('Error creating HQ:', error);
    return NextResponse.json(
      { error: 'Failed to create HQ' },
      { status: 500 }
    );
  }
}

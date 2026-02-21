import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const unit = searchParams.get('unit');
    const camp = searchParams.get('camp');
    const date = searchParams.get('date');

    // Build filter conditions
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (unit) {
      where.unit = unit;
    }

    if (camp) {
      where.camp = {
        name: camp
      };
    }

    // Get patrols with filters
    const patrols = await db.patrol.findMany({
      where,
      include: {
        camp: true,
        sessions: date ? {
          where: { date: date },
          include: {
            locations: {
              orderBy: { timestamp: 'desc' }
            }
          }
        } : false,
        _count: {
          select: {
            sessions: true,
            sosAlerts: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      patrols: patrols.map(p => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        camp: p.camp?.name,
        strength: p.strength,
        status: p.status,
        currentLatitude: p.currentLatitude,
        currentLongitude: p.currentLongitude,
        lastLocationAt: p.lastLocationAt,
        sessionCount: p._count.sessions,
        sosCount: p._count.sosAlerts,
        sessions: p.sessions
      }))
    });
  } catch (error) {
    console.error('Patrols retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve patrols' },
      { status: 500 }
    );
  }
}

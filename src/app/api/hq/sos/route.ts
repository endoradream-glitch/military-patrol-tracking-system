import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const alerts = await db.sOSAlert.findMany({
      include: {
        patrol: true,
        camp: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      alerts: alerts.map(alert => ({
        id: alert.id,
        patrolId: alert.patrolId,
        patrolName: alert.patrol.name,
        campId: alert.campId,
        campName: alert.camp?.name,
        latitude: alert.latitude,
        longitude: alert.longitude,
        message: alert.message,
        status: alert.status,
        alertedNearby: alert.alertedNearby ? JSON.parse(alert.alertedNearby) : [],
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt
      }))
    });
  } catch (error) {
    console.error('SOS alerts retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve SOS alerts' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sosId, status } = body;

    if (!sosId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedAlert = await db.sOSAlert.update({
      where: { id: sosId },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      alert: updatedAlert
    });
  } catch (error) {
    console.error('SOS update error:', error);
    return NextResponse.json(
      { error: 'Failed to update SOS alert' },
      { status: 500 }
    );
  }
}

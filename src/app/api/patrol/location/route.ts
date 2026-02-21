import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patrolId, latitude, longitude, altitude, accuracy, timestamp, sessionId } = body;

    // Validate input
    if (!patrolId || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update patrol's current location
    const patrol = await db.patrol.update({
      where: { id: patrolId },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastLocationAt: new Date(timestamp || Date.now())
      }
    });

    // Save location history
    await db.locationHistory.create({
      data: {
        patrolId: patrolId,
        sessionId: sessionId || null,
        latitude: latitude,
        longitude: longitude,
        altitude: altitude || null,
        accuracy: accuracy || null,
        timestamp: new Date(timestamp || Date.now())
      }
    });

    return NextResponse.json({
      success: true,
      patrol: {
        id: patrol.id,
        latitude: patrol.currentLatitude,
        longitude: patrol.currentLongitude,
        lastLocationAt: patrol.lastLocationAt
      }
    });
  } catch (error) {
    console.error('Location update error:', error);
    return NextResponse.json(
      { error: 'Location update failed' },
      { status: 500 }
    );
  }
}

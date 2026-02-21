import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patrolId, locations } = body;

    // Validate input
    if (!patrolId || !locations || !Array.isArray(locations)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the latest active session
    const session = await db.patrolSession.findFirst({
      where: {
        patrolId: patrolId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    });

    const sessionId = session?.id || null;

    // Batch insert location history
    await Promise.all(
      locations.map((loc: any) =>
        db.locationHistory.create({
          data: {
            patrolId: patrolId,
            sessionId: sessionId,
            latitude: loc.latitude,
            longitude: loc.longitude,
            altitude: loc.altitude || null,
            accuracy: loc.accuracy || null,
            timestamp: new Date(loc.timestamp || Date.now())
          }
        })
      )
    );

    // Update patrol's current location with the latest one
    const latestLocation = locations[locations.length - 1];
    await db.patrol.update({
      where: { id: patrolId },
      data: {
        currentLatitude: latestLocation.latitude,
        currentLongitude: latestLocation.longitude,
        lastLocationAt: new Date(latestLocation.timestamp || Date.now())
      }
    });

    return NextResponse.json({
      success: true,
      synced: locations.length
    });
  } catch (error) {
    console.error('Location sync error:', error);
    return NextResponse.json(
      { error: 'Location sync failed' },
      { status: 500 }
    );
  }
}

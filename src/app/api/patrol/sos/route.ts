import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patrolId, latitude, longitude, message } = body;

    // Validate input
    if (!patrolId || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get patrol details
    const patrol = await db.patrol.findUnique({
      where: { id: patrolId },
      include: { camp: true }
    });

    if (!patrol) {
      return NextResponse.json(
        { error: 'Patrol not found' },
        { status: 404 }
      );
    }

    // Find nearest 3 patrols (simple distance calculation)
    const allPatrols = await db.patrol.findMany({
      where: {
        id: { not: patrolId },
        status: 'patrolling',
        currentLatitude: { not: null },
        currentLongitude: { not: null }
      }
    });

    // Calculate distances and find nearest 3
    const patrolsWithDistance = allPatrols
      .map(p => {
        if (p.currentLatitude && p.currentLongitude) {
          const distance = calculateDistance(
            latitude, longitude,
            p.currentLatitude, p.currentLongitude
          );
          return { patrol: p, distance };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.distance - b!.distance)
      .slice(0, 3);

    const nearbyPatrolIds = patrolsWithDistance.map(p => p!.patrol.id);

    // Create SOS alert
    const sosAlert = await db.sOSAlert.create({
      data: {
        patrolId: patrolId,
        campId: patrol.campId,
        latitude: latitude,
        longitude: longitude,
        message: message || 'SOS - Emergency',
        status: 'active',
        alertedNearby: JSON.stringify(nearbyPatrolIds)
      }
    });

    // Update patrol status to SOS
    await db.patrol.update({
      where: { id: patrolId },
      data: { status: 'sos' }
    });

    return NextResponse.json({
      success: true,
      sosAlert: {
        id: sosAlert.id,
        patrolId: sosAlert.patrolId,
        latitude: sosAlert.latitude,
        longitude: sosAlert.longitude,
        message: sosAlert.message,
        status: sosAlert.status,
        createdAt: sosAlert.createdAt
      },
      nearbyPatrols: nearbyPatrolIds
    });
  } catch (error) {
    console.error('SOS creation error:', error);
    return NextResponse.json(
      { error: 'SOS alert creation failed' },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// GET endpoint to retrieve active SOS alerts
export async function GET() {
  try {
    const activeAlerts = await db.sOSAlert.findMany({
      where: { status: { in: ['active', 'responding'] } },
      include: {
        patrol: true,
        camp: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      alerts: activeAlerts
    });
  } catch (error) {
    console.error('SOS retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve SOS alerts' },
      { status: 500 }
    );
  }
}

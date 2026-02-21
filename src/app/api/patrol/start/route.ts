import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patrolId, action } = body; // action: 'start' or 'stop'

    // Validate input
    if (!patrolId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const patrol = await db.patrol.findUnique({
      where: { id: patrolId }
    });

    if (!patrol) {
      return NextResponse.json(
        { error: 'Patrol not found' },
        { status: 404 }
      );
    }

    if (action === 'start') {
      // Check if there's already an active session for today
      const today = new Date().toISOString().split('T')[0];
      let session = await db.patrolSession.findFirst({
        where: {
          patrolId: patrolId,
          date: today,
          status: 'active'
        }
      });

      if (!session) {
        // Create new session
        session = await db.patrolSession.create({
          data: {
            patrolId: patrolId,
            date: today,
            startTime: new Date(),
            status: 'active'
          }
        });
      }

      // Update patrol status
      await db.patrol.update({
        where: { id: patrolId },
        data: { status: 'patrolling' }
      });

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          date: session.date,
          startTime: session.startTime,
          status: session.status
        },
        patrolStatus: 'patrolling'
      });
    } else if (action === 'stop') {
      // Find active session and update it
      const session = await db.patrolSession.findFirst({
        where: {
          patrolId: patrolId,
          status: 'active'
        },
        orderBy: { createdAt: 'desc' }
      });

      if (session) {
        await db.patrolSession.update({
          where: { id: session.id },
          data: {
            endTime: new Date(),
            status: 'completed'
          }
        });
      }

      // Update patrol status
      await db.patrol.update({
        where: { id: patrolId },
        data: { status: 'idle' }
      });

      return NextResponse.json({
        success: true,
        patrolStatus: 'idle'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Patrol start/stop error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}

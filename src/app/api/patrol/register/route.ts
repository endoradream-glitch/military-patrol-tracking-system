import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { camp, unit, name, strength } = body;

    // Validate input
    if (!camp || !unit || !name || !strength) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if camp exists, create if not
    let campRecord = await db.camp.findFirst({
      where: { name: camp }
    });

    if (!campRecord) {
      campRecord = await db.camp.create({
        data: {
          name: camp,
          unit: unit,
          latitude: 0,
          longitude: 0,
          description: `Camp ${camp}`
        }
      });
    }

    // Check if patrol with same name and unit exists
    let patrol = await db.patrol.findFirst({
      where: {
        name: name,
        unit: unit
      }
    });

    if (patrol) {
      // Update existing patrol
      patrol = await db.patrol.update({
        where: { id: patrol.id },
        data: {
          campId: campRecord.id,
          strength: strength,
          updatedAt: new Date()
        }
      });
    } else {
      // Generate a unique code for this patrol based on name and unit
      const uniqueSuffix = name.substring(0, 3).toUpperCase() + unit.substring(0, 3).toUpperCase();
      const patrolCode = `1526-${uniqueSuffix}-${Date.now().toString().slice(-4)}`;

      // Create new patrol
      patrol = await db.patrol.create({
        data: {
          code: patrolCode,
          name: name,
          campId: campRecord.id,
          unit: unit,
          strength: strength,
          status: 'idle'
        }
      });
    }

    return NextResponse.json({
      success: true,
      patrol: {
        id: patrol.id,
        code: patrol.code,
        name: patrol.name,
        camp: campRecord.name,
        unit: patrol.unit,
        strength: patrol.strength,
        status: patrol.status
      }
    });
  } catch (error) {
    console.error('Patrol registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

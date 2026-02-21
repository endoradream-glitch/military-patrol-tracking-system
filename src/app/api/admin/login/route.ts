import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, password } = body;

    // Super Admin access code
    const SUPER_ADMIN_CODE = '92481526';

    if (code !== SUPER_ADMIN_CODE) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      );
    }

    // Find or create default super admin
    let admin = await db.superAdmin.findFirst({
      where: { username: 'superadmin' }
    });

    if (!admin) {
      // Create default super admin with password: admin123
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await db.superAdmin.create({
        data: {
          username: 'superadmin',
          password: hashedPassword,
          name: 'Super Administrator',
          email: 'admin@military.patrol'
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH - Update HQ
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, displayName, logoUrl, isActive, isApproved, adminId } = body;

    const hq = await db.hQ.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(displayName !== undefined && { displayName: displayName.trim() }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(isApproved !== undefined && {
          isApproved,
          approvedBy: isApproved ? adminId : null,
          approvedAt: isApproved ? new Date() : null
        })
      }
    });

    return NextResponse.json({
      success: true,
      hq
    });
  } catch (error) {
    console.error('Error updating HQ:', error);
    return NextResponse.json(
      { error: 'Failed to update HQ' },
      { status: 500 }
    );
  }
}

// DELETE - Delete HQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.hQ.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'HQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting HQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete HQ' },
      { status: 500 }
    );
  }
}

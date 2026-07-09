import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const flag = await prisma.callFlag.findUnique({
      where: { id },
    });

    if (!flag) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
    }

    const updatedFlag = await prisma.callFlag.update({
      where: { id },
      data: { isContested: !flag.isContested },
    });

    return NextResponse.json(updatedFlag);
  } catch (error: any) {
    console.error('Error in contest flag route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [organizations, teams, advisors, callAudits] = await Promise.all([
      prisma.organization.findMany(),
      prisma.team.findMany(),
      prisma.advisor.findMany({
        include: {
          team: true
        }
      }),
      prisma.callAudit.findMany({
        include: {
          advisor: {
            include: {
              team: true
            }
          },
          callFlags: true
        },
        orderBy: {
          callDate: 'desc'
        }
      })
    ]);

    return NextResponse.json({
      organizations,
      teams,
      advisors,
      callAudits
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

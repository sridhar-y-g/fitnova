import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Clear data
    await prisma.callFlag.deleteMany({});
    await prisma.callAudit.deleteMany({});
    await prisma.advisor.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.organization.deleteMany({});

    // Seed Organization
    const org = await prisma.organization.create({
      data: { name: 'FitNova Bangalore' },
    });

    // Seed Teams
    const teamAlpha = await prisma.team.create({
      data: {
        orgId: org.id,
        name: 'Team Alpha (Fat Loss)',
        teamLeaderName: 'Rajesh Kumar',
      },
    });

    const teamBeta = await prisma.team.create({
      data: {
        orgId: org.id,
        name: 'Team Beta (Muscle Gain)',
        teamLeaderName: 'Priyanka Sharma',
      },
    });

    const teamGamma = await prisma.team.create({
      data: {
        orgId: org.id,
        name: 'Team Gamma (Yoga & Wellness)',
        teamLeaderName: 'Amit Patel',
      },
    });

    // Seed Advisors
    const rohan = await prisma.advisor.create({
      data: {
        teamId: teamAlpha.id,
        name: 'Rohan M.',
        email: 'rohan.m@fitnova.com',
      },
    });

    const sridhar = await prisma.advisor.create({
      data: {
        teamId: teamAlpha.id,
        name: 'Sridhar Y.',
        email: 'sridhar.y@fitnova.com',
      },
    });

    const karan = await prisma.advisor.create({
      data: {
        teamId: teamBeta.id,
        name: 'Karan S.',
        email: 'karan.s@fitnova.com',
      },
    });

    const anjali = await prisma.advisor.create({
      data: {
        teamId: teamBeta.id,
        name: 'Anjali D.',
        email: 'anjali.d@fitnova.com',
      },
    });

    const vikram = await prisma.advisor.create({
      data: {
        teamId: teamGamma.id,
        name: 'Vikram R.',
        email: 'vikram.r@fitnova.com',
      },
    });

    // Seed Call Audits and Flags
    const audit1 = await prisma.callAudit.create({
      data: {
        advisorId: rohan.id,
        callDate: new Date('2026-07-09T10:15:00'),
        overallScore: 42,
        needsDiscoveryScore: 40,
        objectionHandlingScore: 50,
        complianceScore: 30,
        audioUrl: '/audio/call_rohan_failed.mp3',
        duration: '3:45',
        rawTranscript: [
          { speaker: 'Advisor', text: 'Namaste! Welcome to FitNova. Let\'s look at your training goals today.', time: '00:12' },
          { speaker: 'Customer', text: 'Haan, main weight loss ke liye dekh raha tha. Mera target hai 15 kg lose karna.', time: '00:25' },
          { speaker: 'Advisor', text: 'Don\'t worry sir, if you sign up right now on our Elite Plan, I can give you guaranteed results of losing 15kg in just 30 days without any diet changes.', time: '00:45' },
          { speaker: 'Customer', text: 'Sacchii? But product specifications and plans kya hain?', time: '01:05' },
          { speaker: 'Advisor', text: 'Aap plan details baad mein dekhna, standard cost is 18,000 rupees. But you have to buy it before I hang up right now, otherwise this discount is gone.', time: '01:25' },
          { speaker: 'Customer', text: 'Thoda budget issue hai, kya main kal batayu?', time: '01:50' },
          { speaker: 'Advisor', text: 'Nahi sir, booking cancel ho jayegi, immediate payment link send kar raha hu.', time: '02:10' }
        ] as any
      }
    });

    await prisma.callFlag.createMany({
      data: [
        {
          callId: audit1.id,
          category: 'OVER_PROMISING',
          severity: 'HIGH',
          quotedLine: 'guaranteed results of losing 15kg in just 30 days without any diet changes',
          reason: 'Explicitly promises extreme physiological results, violating core coaching policy guidelines.',
          timestampAnchor: '00:45',
        },
        {
          callId: audit1.id,
          category: 'PRESSURE_TACTICS',
          severity: 'HIGH',
          quotedLine: 'buy it before I hang up right now, otherwise this discount is gone',
          reason: 'Uses extreme artificial urgency and pressure tactics to force immediate transaction.',
          timestampAnchor: '01:25',
        }
      ]
    });

    await prisma.callAudit.create({
      data: {
        advisorId: sridhar.id,
        callDate: new Date('2026-07-09T11:30:00'),
        overallScore: 88,
        needsDiscoveryScore: 90,
        objectionHandlingScore: 85,
        complianceScore: 90,
        audioUrl: '/audio/call_sridhar_good.mp3',
        duration: '4:12',
        rawTranscript: [
          { speaker: 'Advisor', text: 'Namaste, FitNova team se Sridhar bol raha hu. Kaise hain aap?', time: '00:08' },
          { speaker: 'Customer', text: 'Main badhiya hu. Mujhe ek personal training plan chahiye tha weight manage karne ke liye.', time: '00:18' },
          { speaker: 'Advisor', text: 'Acha, main samajh gaya. Pehle aapka daily routine aur wellness history ke baare mein thoda jaan sakta hu?', time: '00:32' },
          { speaker: 'Customer', text: 'Haan, main desk job pe hu 9 to 6. Zyada active routine nahi hai, aur pehle back pain ki problem thhi.', time: '00:50' },
          { speaker: 'Advisor', text: 'Understood. Humare plans custom hote hain, special attention to back strength. Ek free personalized session book karlein?', time: '01:20' },
          { speaker: 'Customer', text: 'Perfect. Online convenient rahega mere liye weekend par.', time: '01:40' },
          { speaker: 'Advisor', text: 'Done, Sunday morning 10 AM online trial session confirm. Booking details and Google Meet link text kar raha hu.', time: '02:05' }
        ] as any
      }
    });

    const audit3 = await prisma.callAudit.create({
      data: {
        advisorId: karan.id,
        callDate: new Date('2026-07-09T12:00:00'),
        overallScore: 65,
        needsDiscoveryScore: 70,
        objectionHandlingScore: 60,
        complianceScore: 65,
        audioUrl: '/audio/call_karan_med.mp3',
        duration: '2:50',
        rawTranscript: [
          { speaker: 'Advisor', text: 'Hello, welcome to FitNova. This is Karan. Let\'s get you enrolled.', time: '00:06' },
          { speaker: 'Customer', text: 'Hi, fitness coaching plans pricing structure kya hai aapka?', time: '00:14' },
          { speaker: 'Advisor', text: 'Sir, basic package starts at 12,000 and premium package is 22,000 for three months.', time: '00:24' },
          { speaker: 'Customer', text: 'Acha, details kya milengi is premium package mein?', time: '00:40' },
          { speaker: 'Advisor', text: 'Premium mein daily coach chat access, customized meal plan aur weekly video feedback hoga.', time: '00:55' }
        ] as any
      }
    });

    await prisma.callFlag.createMany({
      data: [
        {
          callId: audit3.id,
          category: 'PRICE_BEFORE_VALUE',
          severity: 'MEDIUM',
          quotedLine: 'basic package starts at 12,000 and premium package is 22,000 for three months',
          reason: 'Quoted prices immediately before establishing fitness objectives or needs discovery.',
          timestampAnchor: '00:24',
        }
      ]
    });

    const audit4 = await prisma.callAudit.create({
      data: {
        advisorId: anjali.id,
        callDate: new Date('2026-07-08T15:20:00'),
        overallScore: 72,
        needsDiscoveryScore: 80,
        objectionHandlingScore: 70,
        complianceScore: 65,
        audioUrl: '/audio/call_anjali_weak.mp3',
        duration: '3:10',
        rawTranscript: [
          { speaker: 'Advisor', text: 'Namaste! Welcome to FitNova. How can I help you today?', time: '00:05' },
          { speaker: 'Customer', text: 'Hi, I saw your ad on Instagram. I want to build muscle and improve posture.', time: '00:15' },
          { speaker: 'Advisor', text: 'Great! We have experts in posture correction and strength training. We should definitely do a free trial session.', time: '00:30' },
          { speaker: 'Customer', text: 'Sure, I would love that. When can we do it?', time: '00:45' },
          { speaker: 'Advisor', text: 'Aap bataiye kab time milega, fir main coach ko consult karke bol dungi. Koi jaldi nahi hai.', time: '01:02' },
          { speaker: 'Customer', text: 'Haan, standard weekend par hi theek rahega. Main decide karke batati hu.', time: '01:20' }
        ] as any
      }
    });

    await prisma.callFlag.createMany({
      data: [
        {
          callId: audit4.id,
          category: 'WEAK_TRIAL_BOOKING',
          severity: 'LOW',
          quotedLine: 'Aap bataiye kab time milega, fir main coach ko consult karke bol dungi. Koi jaldi nahi hai.',
          reason: 'Failed to establish a specific, firm date/time anchor for the trial session, leaving the booking open-ended.',
          timestampAnchor: '01:02',
        }
      ]
    });

    await prisma.callAudit.create({
      data: {
        advisorId: vikram.id,
        callDate: new Date('2026-07-08T16:45:00'),
        overallScore: 95,
        needsDiscoveryScore: 95,
        objectionHandlingScore: 95,
        complianceScore: 95,
        audioUrl: '/audio/call_vikram_excellent.mp3',
        duration: '5:22',
        rawTranscript: [
          { speaker: 'Advisor', text: 'Namaste, FitNova wellness consultation team se Vikram bol raha hu. Aapki call humare liye bohot special hai.', time: '00:10' },
          { speaker: 'Customer', text: 'Hi Vikram. I want to join yoga classes. Stress relief and flexibility are my targets.', time: '00:22' },
          { speaker: 'Advisor', text: 'Flexibility and stress reduction are excellent goals. To customize your yoga plan, may I ask if you have any pre-existing health concerns or high-stress triggers?', time: '00:40' },
          { speaker: 'Customer', text: 'I have some mild neck stiffness from screen time. Stress is mostly work-related.', time: '01:05' },
          { speaker: 'Advisor', text: 'Got it. For neck stiffness, our yoga experts design specific neck-shoulder releases. Let\'s schedule a live 1-on-1 online trial on Saturday at 4 PM to experience this first-hand.', time: '01:30' },
          { speaker: 'Customer', text: 'That sounds perfect. Saturday 4 PM works.', time: '01:50' },
          { speaker: 'Advisor', text: 'Awesome. I\'ve reserved your slot. The system is sending you a calendar invite. Hope you enjoy the session!', time: '02:15' }
        ] as any
      }
    });

    return NextResponse.json({ success: true, message: 'Database reset and seeded successfully!' });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

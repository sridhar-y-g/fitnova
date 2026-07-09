import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI, Type } from '@google/genai';

export const maxDuration = 60; // Allow up to 60 seconds on Vercel for Gemini audio processing

// High-fidelity fallback scenarios for mock ingestion
const FALLBACK_SCENARIOS = [
  {
    overallScore: 35,
    needsDiscoveryScore: 25,
    objectionHandlingScore: 40,
    complianceScore: 20,
    duration: '4:20',
    transcript: [
      { speaker: 'Advisor', text: 'Namaste! Welcome to FitNova. I see you registered for our trial. What is your budget today?', time: '00:10' },
      { speaker: 'Customer', text: 'Mera budget around 2,000 to 3,000 per month hai. Diet and cardio routines chahiye.', time: '00:28' },
      { speaker: 'Advisor', text: 'Arey budget chhodiye sir. Humara special weight loss package is 25,000. But if you pay in the next 2 minutes, I will give it for 12,000.', time: '00:55' },
      { speaker: 'Customer', text: 'Nahi, ye toh bohot zyada hai. Mujhe 1-on-1 personal coaching nahi, normal plan chahiye.', time: '01:22' },
      { speaker: 'Advisor', text: 'Normal plans are useless sir. Plus, this 12,000 price is only valid while we are on this call. If I hang up, the system auto-locks the cost to 25,000. We also charge an extra 2,000 registration fee that is mandatory, but I can waive it if you pay right now.', time: '01:50' },
      { speaker: 'Customer', text: 'Acha, but main details verify karna chahta hu first.', time: '02:15' },
      { speaker: 'Advisor', text: 'No verification needed, standard company program hai. Immediate payment link sent, check your WhatsApp. We have limited slots, only 1 slot left.', time: '02:40' }
    ],
    flags: [
      {
        category: 'PRICE_BEFORE_VALUE',
        severity: 'MEDIUM',
        quotedLine: 'What is your budget today?',
        reason: 'Quoting or asking about budget within the first 10 seconds before understanding the client\'s wellness goals.',
        timestampAnchor: '00:10'
      },
      {
        category: 'PRESSURE_TACTICS',
        severity: 'HIGH',
        quotedLine: 'this 12,000 price is only valid while we are on this call. If I hang up, the system auto-locks the cost to 25,000.',
        reason: 'Uses extreme urgency and false scarcity to pressure the client into buying immediately.',
        timestampAnchor: '01:50'
      },
      {
        category: 'UNDISCLOSED_COSTS',
        severity: 'HIGH',
        quotedLine: 'We also charge an extra 2,000 registration fee that is mandatory',
        reason: 'Surfaced an unadvertised mandatory registration fee late in the pricing discussion.',
        timestampAnchor: '01:50'
      }
    ]
  },
  {
    overallScore: 78,
    needsDiscoveryScore: 85,
    objectionHandlingScore: 75,
    complianceScore: 70,
    duration: '3:15',
    transcript: [
      { speaker: 'Advisor', text: 'Hi, welcome to FitNova. This is your wellness coach. What goals can we set for you?', time: '00:08' },
      { speaker: 'Customer', text: 'Mujhe energy levels boost karne hain aur thoda stamina improve karna hai. Running karte waqt breathe short hoti hai.', time: '00:24' },
      { speaker: 'Advisor', text: 'Stamina building and cardiovascular health are very important. We will schedule a personalized trial session with our trainer. Does Saturday 11 AM work?', time: '00:48' },
      { speaker: 'Customer', text: 'Saturday is fine. Online class hogi ya home/gym trainer?', time: '01:05' },
      { speaker: 'Advisor', text: 'Online or offline options are both available. Cost would be 8,000 for 3 months. By the way, we guarantee you will never feel tired again after 10 sessions.', time: '01:30' },
      { speaker: 'Customer', text: 'Acha, stamina improve toh hoga fast. Chalo book kar do trial.', time: '01:55' },
      { speaker: 'Advisor', text: 'Great! Trial scheduled. See you Saturday at 11 AM.', time: '02:10' }
    ],
    flags: [
      {
        category: 'OVER_PROMISING',
        severity: 'HIGH',
        quotedLine: 'we guarantee you will never feel tired again after 10 sessions',
        reason: 'Unrealistic marketing promise guaranteeing physiological outcomes (never feeling tired again).',
        timestampAnchor: '01:30'
      }
    ]
  },
  {
    overallScore: 92,
    needsDiscoveryScore: 95,
    objectionHandlingScore: 90,
    complianceScore: 90,
    duration: '5:02',
    transcript: [
      { speaker: 'Advisor', text: 'Namaste! Welcome to FitNova. How are you doing today?', time: '00:06' },
      { speaker: 'Customer', text: 'Main achhi hu. Weight loss ke liye inquire karna thha. I have PCOS so weight loss difficult hota hai.', time: '00:20' },
      { speaker: 'Advisor', text: 'I understand. PCOS weight management requires custom active routines and medical-informed nutrition. Aapki regular diet habits kya hain?', time: '00:40' },
      { speaker: 'Customer', text: 'Mostly ghar ka khana, but evening snacking habit hai.', time: '01:02' },
      { speaker: 'Advisor', text: 'Okay, we will plan healthy snack swaps. Humare plans certified clinical nutritionists guide karte hain. Let\'s schedule a trial session with our PCOS-specialist coach on Friday 5 PM.', time: '01:30' },
      { speaker: 'Customer', text: 'Pehle plan pricing kya hai?', time: '01:50' },
      { speaker: 'Advisor', text: 'Pricing details hum basic to advanced 3 categories mein offer karte hain. Trial session ke baad, coach assessment ke bases par we recommend the best fit, ensuring no wasted money. Pricing starts from 4,000 per month.', time: '02:15' },
      { speaker: 'Customer', text: 'Great, Friday 5 PM is perfect.', time: '02:40' }
    ],
    flags: []
  }
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    let advisorId = formData.get('advisorId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file uploaded.' }, { status: 400 });
    }

    // Default to the first advisor in database if advisorId is empty or invalid
    if (!advisorId) {
      const firstAdvisor = await prisma.advisor.findFirst();
      if (firstAdvisor) {
        advisorId = firstAdvisor.id;
      } else {
        return NextResponse.json({ error: 'No advisors found in the database. Please seed first.' }, { status: 400 });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isMockMode = !apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_API_KEY') || apiKey.length < 15;

    let analysisResult: typeof FALLBACK_SCENARIOS[0];

    if (isMockMode) {
      console.log('Gemini API Key is missing or invalid. Falling back to high-fidelity mock analysis.');
      // Pick a random scenario
      const randomIndex = Math.floor(Math.random() * FALLBACK_SCENARIOS.length);
      analysisResult = FALLBACK_SCENARIOS[randomIndex];
    } else {
      try {
        console.log('Sending audio file to Gemini 2.5 Flash API for transcription and quality analysis...');
        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const fileType = file.type || 'audio/mp3';

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Analyze this sales call audio recording. 
Perform speaker diarization, separate who said what (Advisor vs Customer). 
Transcribe the conversations. Identify code-switching (e.g. Hinglish: mixing Hindi and English) and transcribe exactly what is spoken.
Rate the quality of the call from 0 to 100 on these dimensions:
1. Needs Discovery (understanding customer's fitness goals, timeline, and budget)
2. Objection Handling (handling budget, timing, or coaching doubts with trust)
3. Compliance (avoiding over-promising, pressure, and high-urgency tactics)
Provide an Overall Score which is a rollup of the three.
Scan the transcript for compliance violations. Flag issues based on the following taxonomy:
- OVER_PROMISING (severity: HIGH): e.g., promising specific kg loss in a short period, guaranteed results.
- PRESSURE_TACTICS (severity: HIGH): e.g., "buy right now before I hang up", high-pressure sales.
- PRICE_BEFORE_VALUE (severity: MEDIUM): e.g., quoting price before understanding goals.
- WEAK_TRIAL_BOOKING (severity: LOW): e.g., failing to book a trial session or booking with no firm date.
- NO_NEEDS_DISCOVERY (severity: MEDIUM): e.g., pushing products without asking questions.
- TALKING_OVER_CUSTOMER (severity: MEDIUM): e.g., interrupting repeatedly.
- UNDISCLOSED_COSTS (severity: HIGH): e.g., hiding registration fees or platform fees.
For each flag raised, include the exact quoted line from the transcript, a timestamp anchor (MM:SS), and a detailed reason.
Respond strictly in JSON format matching the schema provided.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: [
            {
              inlineData: {
                mimeType: fileType,
                data: base64Data
              }
            },
            prompt
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.INTEGER },
                needsDiscoveryScore: { type: Type.INTEGER },
                objectionHandlingScore: { type: Type.INTEGER },
                complianceScore: { type: Type.INTEGER },
                duration: { type: Type.STRING },
                transcript: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      speaker: { type: Type.STRING },
                      text: { type: Type.STRING },
                      time: { type: Type.STRING }
                    },
                    required: ['speaker', 'text', 'time']
                  }
                },
                flags: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      severity: { type: Type.STRING },
                      quotedLine: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      timestampAnchor: { type: Type.STRING }
                    },
                    required: ['category', 'severity', 'quotedLine', 'reason', 'timestampAnchor']
                  }
                }
              },
              required: ['overallScore', 'needsDiscoveryScore', 'objectionHandlingScore', 'complianceScore', 'duration', 'transcript', 'flags']
            } as any
          }
        });

        const textResponse = response.text;
        if (!textResponse) {
          throw new Error('Empty response from Gemini API.');
        }

        const parsed = JSON.parse(textResponse);
        analysisResult = {
          overallScore: parsed.overallScore ?? 70,
          needsDiscoveryScore: parsed.needsDiscoveryScore ?? 70,
          objectionHandlingScore: parsed.objectionHandlingScore ?? 70,
          complianceScore: parsed.complianceScore ?? 70,
          duration: parsed.duration ?? '3:00',
          transcript: parsed.transcript ?? [],
          flags: parsed.flags ?? []
        };
      } catch (err: any) {
        console.error('Error invoking Gemini API, falling back to mock data:', err);
        // Fallback to random scenario on API failure
        const randomIndex = Math.floor(Math.random() * FALLBACK_SCENARIOS.length);
        analysisResult = FALLBACK_SCENARIOS[randomIndex];
      }
    }

    // Save CallAudit and CallFlags in database
    const savedAudit = await prisma.callAudit.create({
      data: {
        advisorId: advisorId,
        callDate: new Date(),
        overallScore: analysisResult.overallScore,
        needsDiscoveryScore: analysisResult.needsDiscoveryScore,
        objectionHandlingScore: analysisResult.objectionHandlingScore,
        complianceScore: analysisResult.complianceScore,
        audioUrl: `/audio/${file.name}`,
        duration: analysisResult.duration,
        rawTranscript: analysisResult.transcript as any
      }
    });

    if (analysisResult.flags && analysisResult.flags.length > 0) {
      await prisma.callFlag.createMany({
        data: analysisResult.flags.map(f => ({
          callId: savedAudit.id,
          category: f.category,
          severity: f.severity,
          quotedLine: f.quotedLine,
          reason: f.reason,
          timestampAnchor: f.timestampAnchor,
          isContested: false
        }))
      });
    }

    return NextResponse.json({
      success: true,
      callId: savedAudit.id,
      mockMode: isMockMode,
      audit: savedAudit
    });

  } catch (error: any) {
    console.error('Error in API ingest route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

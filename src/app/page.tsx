'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Activity, 
  HelpCircle, 
  UploadCloud, 
  ShieldAlert, 
  Users, 
  FileText, 
  ArrowRight,
  Volume2,
  TrendingUp,
  Sliders,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 md:px-8 relative font-sans select-none overflow-y-auto flex items-center justify-center animate-fade-in pb-16">
      {/* Noise texture overlay */}
      <div className="absolute inset-0 noise-overlay z-0" />
      
      <div className="max-w-[1400px] w-full relative z-10 space-y-8 my-auto">
        
        {/* ================= HEADER BOX ================= */}
        <header className="rounded-2xl bg-chassis border border-white/40 shadow-card p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative animate-slide-up">


          <div className="flex items-center gap-4 pl-3">
            <div className="p-3 rounded-full shadow-pressed bg-recessed flex items-center justify-center relative">
              <Activity className="h-7 w-7 text-safety-orange relative z-10" />
              <div className="absolute inset-0 rounded-full border border-safety-orange/30 animate-ping" />
            </div>
            <div>
              <div className="text-2xs font-mono font-bold tracking-widest text-muted-text uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                SYSTEM TELEMETRY LINK ESTABLISHED
              </div>
              <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-primary-text uppercase drop-shadow-[0_1px_0_#ffffff]">
                Sales-Call Intelligence Platform
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 pr-3 text-2xs font-mono font-bold text-primary-text uppercase">
            <span className="text-muted-text">NODE: FITNOVA-BGLR</span>
            <span className="w-2.5 h-2.5 rounded-full led-green animate-led-pulse" />
          </div>
        </header>

        {/* ================= MAIN 2-COLUMN SPLIT PANEL ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ================= LEFT COLUMN: HERO CONTENT & ACTIONS (7 cols) ================= */}
          <main className="lg:col-span-7 rounded-3xl bg-chassis border border-white/40 shadow-card p-6 md:p-8 relative flex flex-col justify-between space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>


            <div className="space-y-6">
              {/* Intro Title */}
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-recessed shadow-recessed text-2xs font-mono font-bold text-safety-orange uppercase tracking-wider">
                  FITNOVA TELE-AUDIT SYSTEM
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-primary-text tracking-tight uppercase leading-tight drop-shadow-[0_1px_0_#ffffff]">
                  Analyze. Score.<br />Coach Sales Teams.
                </h2>
                <p className="text-xs text-muted-text leading-relaxed font-semibold">
                  FitNova's automated call auditing console empowers Sales Directors, Pod Leaders, and Advisors to monitor enrollment quality, examine Hinglish dialogue transcripts, and contest compliance flags through AI-driven auditing.
                </p>
              </div>

              {/* Quick Services Overview with Custom Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-recessed/15 border border-white/20 shadow-card space-y-2">
                  <div className="h-8 w-8 rounded-lg shadow-pressed bg-recessed flex items-center justify-center text-safety-orange">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-2xs font-bold text-primary-text uppercase">Pod Dashboards</h4>
                  <p className="text-3xs text-muted-text font-semibold leading-relaxed">
                    Visual team health rollups and quality indicators for Alpha, Beta, and Gamma pods.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-recessed/15 border border-white/20 shadow-card space-y-2">
                  <div className="h-8 w-8 rounded-lg shadow-pressed bg-recessed flex items-center justify-center text-safety-orange">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-2xs font-bold text-primary-text uppercase">Diarized Hinglish</h4>
                  <p className="text-3xs text-muted-text font-semibold leading-relaxed">
                    Code-switching transcripts mapped with speaker identity and compliance flag tags.
                  </p>
                </div>
              </div>
            </div>

            {/* Launch CTA Trigger */}
            <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-safety-orange text-white hover:brightness-110 active:scale-[0.98] transition-all font-mono font-black text-xs uppercase tracking-widest shadow-[8px_8px_16px_rgba(255,71,87,0.3)] flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>[ LAUNCH CONTROL CONSOLE ]</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="text-center sm:text-left">
                <span className="text-4xs font-mono text-muted-text block uppercase tracking-widest">
                  TELEMETRY DATABASE CONNECTED
                </span>
                <span className="text-3xs text-primary-text font-bold uppercase font-mono">
                  SECURE PORT 4000
                </span>
              </div>
            </div>
          </main>

          {/* ================= RIGHT COLUMN: INTERACTIVE VISUALIZATION DECK (5 cols) ================= */}
          <section className="lg:col-span-5 rounded-3xl bg-chassis border border-white/40 shadow-card p-6 relative flex flex-col justify-between space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>


            <div className="space-y-4">
              <h3 className="text-2xs font-mono font-bold text-primary-text uppercase tracking-wider flex items-center gap-2 border-b border-black/10 pb-2">
                <Sliders className="h-4 w-4 text-safety-orange" />
                REAL-TIME TELEMETRY SCAN
              </h3>

              {/* Carbon Monitor Display Screen */}
              <div className="carbon-pattern rounded-xl p-4 border border-black/90 relative overflow-hidden space-y-4">
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-safety-orange animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>

                <div className="text-4xs font-mono text-safety-orange uppercase tracking-widest">SIGNAL WAVE OSCILLOSCOPE</div>

                {/* Animated Waveform Display */}
                <div className="h-24 bg-black/60 rounded border border-neutral-900 shadow-inner p-2 relative flex items-center justify-center overflow-hidden scanlines">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid-pattern opacity-10" />

                  {/* Animated Waveform Lines (Multiple layers) */}
                  <svg className="absolute inset-x-0 w-full h-full text-safety-orange/50" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path 
                      d="M0,15 Q10,2 20,25 T40,5 T60,20 T80,10 T100,15" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1" 
                      className="animate-[pulse-gentle_1.8s_infinite_ease-in-out]" 
                    />
                    <path 
                      d="M0,15 Q15,28 30,8 T60,22 T90,2 T100,15" 
                      fill="none" 
                      stroke="#22c55e" 
                      strokeWidth="0.8" 
                      className="animate-[pulse-gentle_2.5s_infinite_ease-in-out] opacity-60" 
                    />
                  </svg>

                  {/* Scanning Radar Line */}
                  <div className="absolute top-0 bottom-0 w-[2px] bg-green-400/40 shadow-[0_0_8px_#22c55e] left-0 animate-[scan_3s_linear_infinite]" />

                  {/* Frequency Bars */}
                  <div className="absolute bottom-2 inset-x-4 flex items-end justify-between h-8 opacity-40">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-[2px] bg-safety-orange rounded-full" 
                        style={{ 
                          height: `${Math.sin(i * 0.5) * 60 + 40}%`,
                          animation: `soundwave ${0.6 + (i % 5) * 0.15}s ease-in-out infinite alternate`
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Simulated Logs Stream */}
                <div className="font-mono text-4xs text-green-400 space-y-1 select-none">
                  <div className="flex justify-between">
                    <span>[SYS_LOG] Gem-2.5 Ingestion Active</span>
                    <span className="animate-pulse">STREAMING</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>[DB_COMM] TiDB Gateway Port 4000</span>
                    <span>ONLINE</span>
                  </div>
                  <div className="text-yellow-500">[WARN] PriceBeforeValue detected at 00:24</div>
                </div>
              </div>

              {/* Instructions Steps Neumorphic Panel */}
              <div className="p-4.5 rounded-xl shadow-recessed bg-recessed/30 space-y-3">
                <h4 className="text-3xs font-mono font-bold text-muted-text uppercase tracking-wider">CONSOLE OPERATION INSTRUCTIONS</h4>
                
                <div className="space-y-2.5 text-3xs font-semibold text-muted-text leading-relaxed">
                  <div className="flex gap-2 items-start">
                    <span className="h-4.5 w-4.5 rounded-full shadow-pressed bg-recessed flex items-center justify-center text-primary-text font-mono font-bold text-4xs shrink-0">1</span>
                    <div>
                      <strong className="text-primary-text uppercase">Verify Settings</strong>: Check PWR and DB indicators. Enable Sandbox Mode if using mock keys.
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="h-4.5 w-4.5 rounded-full shadow-pressed bg-recessed flex items-center justify-center text-primary-text font-mono font-bold text-4xs shrink-0">2</span>
                    <div>
                      <strong className="text-primary-text uppercase">Ingest Stream</strong>: Upload audio calls to trigger Gemini transcript & policy checks.
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="h-4.5 w-4.5 rounded-full shadow-pressed bg-recessed flex items-center justify-center text-primary-text font-mono font-bold text-4xs shrink-0">3</span>
                    <div>
                      <strong className="text-primary-text uppercase">Review Appeals</strong>: Examine compliance flags and process advisor dispute requests.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro details */}
            <div className="flex justify-between items-center text-4xs font-mono text-muted-text border-t border-black/5 pt-3">
              <span>SYSTEM: OK</span>
              <span>BUFFERING SIGNAL DIAGRAM</span>
            </div>

          </section>
        </div>

        {/* Footer info */}
        <footer className="flex justify-between items-center text-3xs font-mono text-muted-text px-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <span>FITNOVA TELE-ENGINEERING V1.2</span>
          <span>© 2026 FITNOVA BANGALORE</span>
        </footer>

      </div>
    </div>
  );
}

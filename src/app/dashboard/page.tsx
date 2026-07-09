'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sliders, 
  Volume2, 
  Activity, 
  Phone, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Users, 
  TrendingUp, 
  RotateCcw, 
  FileText, 
  ShieldAlert,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  FolderSync,
  Home,
  X,
  VolumeX,
  Check,
  ChevronRight,
  Database
} from 'lucide-react';

interface CallFlag {
  id: string;
  callId: string;
  category: string;
  severity: string;
  quotedLine: string;
  reason: string;
  timestampAnchor: string;
  isContested: boolean;
}

interface Team {
  id: string;
  name: string;
  teamLeaderName: string;
}

interface Advisor {
  id: string;
  name: string;
  email: string;
  teamId: string;
  team: Team;
}

interface CallAudit {
  id: string;
  advisorId: string;
  callDate: string;
  overallScore: number;
  needsDiscoveryScore: number;
  objectionHandlingScore: number;
  complianceScore: number;
  audioUrl: string | null;
  duration: string;
  rawTranscript: any;
  advisor: Advisor;
  callFlags: CallFlag[];
}

export default function Dashboard() {
  const [data, setData] = useState<{
    organizations: any[];
    teams: Team[];
    advisors: Advisor[];
    callAudits: CallAudit[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected state
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSeedOpen, setIsSeedOpen] = useState(false);

  // Audio playback emulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  // Ingestion upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAdvisorId, setUploadAdvisorId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // General state
  const [seeding, setSeeding] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      setData(json);
      
      // Auto-select the first call audit if none selected
      if (json.callAudits && json.callAudits.length > 0 && !selectedCallId) {
        setSelectedCallId(json.callAudits[0].id);
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Set up playback timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          const maxSec = 250;
          if (prev >= maxSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle flag contestation
  const handleContestFlag = async (flagId: string) => {
    try {
      const res = await fetch(`/api/flags/${flagId}/contest`, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Failed to contest flag');
      
      // Update local state instead of doing full reload
      if (data) {
        const updatedAudits = data.callAudits.map(audit => {
          const hasFlag = audit.callFlags.some(f => f.id === flagId);
          if (hasFlag) {
            return {
              ...audit,
              callFlags: audit.callFlags.map(f => f.id === flagId ? { ...f, isContested: !f.isContested } : f)
            };
          }
          return audit;
        });
        setData({ ...data, callAudits: updatedAudits });
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Reset & Seed Database
  const handleResetSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset and seed database');
      await fetchDashboardData();
      setIsSeedOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  // Handle ingestion file submit
  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select an audio file first.');
      return;
    }

    // Vercel Serverless payload limit is 4.5MB
    const MAX_FILE_SIZE = 4.5 * 1024 * 1024;
    if (uploadFile.size > MAX_FILE_SIZE) {
      alert(`The selected file (${(uploadFile.size / (1024 * 1024)).toFixed(2)}MB) exceeds Vercel's Serverless payload limit of 4.5MB.\n\nPlease select a compressed audio file or smaller clip.`);
      return;
    }
    
    try {
      setUploading(true);
      setUploadStatus('Reading file buffer...');
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      if (uploadAdvisorId) {
        formData.append('advisorId', uploadAdvisorId);
      }
      
      setUploadStatus('Sending stream payload to server...');
      
      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ingestion failed');
      }

      const result = await res.json();
      setUploadStatus('Ingestion success!');
      
      // Reload and select the new call
      await fetchDashboardData();
      if (result.callId) {
        setSelectedCallId(result.callId);
      }
      
      setUploadFile(null);
      // Reset input element
      const fileInput = document.getElementById('audio-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setIsUploadOpen(false);

    } catch (err: any) {
      console.error(err);
      alert(`Ingestion Error: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  // Format seconds to MM:SS
  const formatSec = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Derived state calculations
  const audits = data?.callAudits || [];
  
  // Filter audits
  const filteredAudits = audits.filter(audit => {
    const matchesTeam = filterTeam === 'all' || audit.advisor.teamId === filterTeam;
    const matchesSearch = searchQuery.trim() === '' || 
      audit.advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.advisor.team.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const selectedCall = audits.find(a => a.id === selectedCallId) || null;

  // Org level metrics (computed from all audits)
  const totalCalls = audits.length;
  const orgAverageScore = totalCalls > 0 
    ? Math.round(audits.reduce((acc, curr) => acc + curr.overallScore, 0) / totalCalls) 
    : 0;
  
  const allFlags = audits.flatMap(a => a.callFlags);
  const totalHighFlags = allFlags.filter(f => f.severity === 'HIGH').length;
  const totalContestedFlags = allFlags.filter(f => f.isContested).length;

  // Compute team average rollups
  const teamRollups = data?.teams.map(team => {
    const teamAudits = audits.filter(a => a.advisor.teamId === team.id);
    const avg = teamAudits.length > 0
      ? Math.round(teamAudits.reduce((acc, curr) => acc + curr.overallScore, 0) / teamAudits.length)
      : 0;
    const highFlagsCount = teamAudits.flatMap(a => a.callFlags).filter(f => f.severity === 'HIGH').length;
    return {
      ...team,
      averageScore: avg,
      highFlags: highFlagsCount,
      totalCalls: teamAudits.length
    };
  }) || [];

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 pt-6 pb-28 md:px-8 relative font-sans select-none overflow-y-auto animate-fade-in">
      {/* Noise texture overlay */}
      <div className="absolute inset-0 noise-overlay z-0" />
      
      <div className="max-w-[1400px] mx-auto relative z-10 space-y-6">
        
        {/* ================= HEADER CONSOLE ================= */}
        <header className="rounded-2xl bg-chassis border border-white/40 shadow-card p-5 flex flex-col lg:flex-row items-center justify-between gap-6 relative">


          {/* Title Branding */}
          <div className="flex items-center gap-4 pl-3">
            <div className="p-3 rounded-full shadow-pressed bg-recessed flex items-center justify-center relative">
              <Activity className="h-8 w-8 text-safety-orange relative z-10" />
              {isPlaying && (
                <div className="absolute inset-0 rounded-full border border-safety-orange/40 animate-ping" />
              )}
            </div>
            <div>
              <div className="text-2xs font-mono font-bold tracking-widest text-muted-text uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                SYSTEM OPERATIONAL
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-primary-text drop-shadow-[0_1px_0_#ffffff] uppercase">
                FitNova Tele-Audit Console
              </h1>
            </div>
          </div>

          {/* LED indicators */}
          <div className="flex flex-wrap items-center gap-6 p-3.5 rounded-xl shadow-recessed bg-recessed/60 font-mono text-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full led-green animate-led-pulse" />
              <span className="text-primary-text font-bold uppercase">PWR</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${(!data || loading) ? 'led-orange animate-led-pulse' : 'led-green'}`} />
              <span className="text-primary-text font-bold uppercase">DB CLOUD</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full led-orange animate-led-pulse" />
              <span className="text-safety-orange uppercase">SANDBOX API</span>
            </div>
          </div>

          {/* Control Triggers */}
          <div className="flex flex-wrap items-center gap-3 pr-3">
            <Link 
              href="/"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-chassis text-primary-text border border-white/50 shadow-card hover:shadow-floating active:shadow-pressed active:translate-y-[2px] transition-all font-mono font-bold text-xs uppercase cursor-pointer"
            >
              <Home className="h-3.5 w-3.5 text-safety-orange" />
              INFO GUIDE
            </Link>

            <button 
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-chassis text-primary-text border border-white/50 shadow-card hover:shadow-floating active:shadow-pressed active:translate-y-[2px] transition-all font-mono font-bold text-xs uppercase cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5 text-safety-orange" />
              INGEST CALL
            </button>

            <button 
              onClick={() => setIsSeedOpen(true)}
              disabled={seeding}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-chassis text-primary-text border border-white/50 shadow-card hover:shadow-floating active:shadow-pressed active:translate-y-[2px] transition-all font-mono font-bold text-xs uppercase cursor-pointer"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-safety-orange ${seeding ? 'animate-spin' : ''}`} />
              RESET
            </button>
          </div>
        </header>

        {/* ================= MAIN COLUMN GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT SIDEBAR (4 cols): METRICS & POD STATUS ================= */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Sales Director Quality Gauge */}
            <section className="rounded-2xl bg-chassis border border-white/40 shadow-card p-6 relative overflow-hidden animate-slide-up">

              
              <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-5">
                <h2 className="text-2xs font-mono font-bold tracking-wider text-muted-text uppercase flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-safety-orange" />
                  ORGANIZATION HEALTH
                </h2>
                <span className="text-3xs font-mono bg-recessed px-2 py-0.5 rounded shadow-recessed font-bold text-muted-text uppercase">
                  DIRECTOR VIEW
                </span>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs font-mono text-muted-text">Awaiting server response...</div>
              ) : (
                <div className="space-y-6">
                  {/* Gauge score card */}
                  <div className="p-4 rounded-xl shadow-recessed bg-recessed/35 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-3xs font-mono font-bold text-muted-text uppercase">Quality Average</div>
                      <div className="text-3xl font-mono font-black text-primary-text mt-0.5">{orgAverageScore}%</div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-1/2 flex flex-col gap-1.5">
                      <div className="h-3.5 w-full rounded-full bg-recessed shadow-pressed overflow-hidden p-0.5">
                        <div 
                          className="h-full rounded-full bg-safety-orange transition-all duration-1000 shadow-orange-glow"
                          style={{ width: `${orgAverageScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-4xs font-mono text-muted-text">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational counters */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-lg shadow-pressed bg-recessed/25 text-center font-mono">
                      <div className="text-4xs font-bold text-muted-text uppercase">Audits</div>
                      <div className="text-lg font-black text-primary-text mt-0.5">{totalCalls}</div>
                    </div>
                    <div className="p-2.5 rounded-lg shadow-pressed bg-recessed/25 text-center font-mono">
                      <div className="text-4xs font-bold text-muted-text uppercase">High Flags</div>
                      <div className="text-lg font-black text-red-500 mt-0.5">{totalHighFlags}</div>
                    </div>
                    <div className="p-2.5 rounded-lg shadow-pressed bg-recessed/25 text-center font-mono">
                      <div className="text-4xs font-bold text-muted-text uppercase">Appeals</div>
                      <div className="text-lg font-black text-amber-500 mt-0.5">{totalContestedFlags}</div>
                    </div>
                  </div>

                  {/* Pod / Team metrics */}
                  <div className="space-y-2 mt-2">
                    <h3 className="text-3xs font-mono font-bold text-muted-text uppercase tracking-wider">Advisor Pod Summary</h3>
                    {teamRollups.map((team, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-panel border border-white/50 shadow-card flex items-center justify-between text-xxs transition-all hover:scale-[1.01] hover:shadow-floating">
                        <div className="font-bold text-primary-text">{team.name}</div>
                        <div className="flex items-center gap-3 font-mono">
                          <div className="text-right">
                            <span className="text-4xs text-muted-text uppercase font-bold block">Score</span>
                            <span className="font-black text-primary-text">{team.averageScore}%</span>
                          </div>
                          <div className="text-right border-l border-black/10 pl-2">
                            <span className="text-4xs text-muted-text uppercase font-bold block">Flags</span>
                            <span className={`font-black ${team.highFlags > 0 ? 'text-red-500' : 'text-green-600'}`}>{team.highFlags}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Quick-Help / Compliance rules */}
            <section className="rounded-2xl bg-chassis border border-white/40 shadow-card p-5 relative animate-slide-up">

              
              <h3 className="text-2xs font-mono font-bold tracking-wider text-muted-text uppercase flex items-center gap-2 border-b border-black/10 pb-2 mb-3">
                <HelpCircle className="h-3.5 w-3.5 text-safety-orange" />
                AUDITING STANDARDS
              </h3>
              
              <ul className="space-y-2 text-xxs font-semibold text-muted-text leading-relaxed">
                <li className="flex items-start gap-2 bg-recessed/30 p-2 rounded">
                  <span className="text-red-500 font-bold font-mono">HIGH:</span>
                  <span>Over-Promising physiological targets or using aggressive psychological pressure tactics.</span>
                </li>
                <li className="flex items-start gap-2 bg-recessed/30 p-2 rounded">
                  <span className="text-amber-600 font-bold font-mono">MED:</span>
                  <span>Quoting plan costs before establishing fitness discovery goals or talking over the customer.</span>
                </li>
                <li className="flex items-start gap-2 bg-recessed/30 p-2 rounded">
                  <span className="text-green-600 font-bold font-mono">LOW:</span>
                  <span>Weak trial bookings without securing a specific online/offline appointment slot.</span>
                </li>
              </ul>
            </section>
          </div>

          {/* ================= RIGHT MAIN LAYOUT (8 cols): QUEUE & DIALER ================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Audit Registry Table */}
            <section className="rounded-2xl bg-chassis border border-white/40 shadow-card p-5 relative animate-slide-up">


              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-black/10 pb-3.5 mb-4 gap-4">
                <h2 className="text-2xs font-mono font-bold tracking-wider text-muted-text uppercase flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-safety-orange" />
                  COACHING QUEUE & AUDIT REGISTRY
                </h2>
                
                {/* Search & Filter tools */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Advisor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 w-40 md:w-56 rounded bg-chassis border-none shadow-recessed text-2xs font-mono focus:outline-none focus:ring-1 focus:ring-safety-orange placeholder-muted-text"
                    />
                    <Search className="h-3 w-3 text-muted-text absolute left-2.5 top-2.5" />
                  </div>
                  
                  <select
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                    className="px-2 py-1.5 rounded bg-chassis border-none shadow-recessed text-3xs font-mono focus:outline-none text-primary-text font-bold cursor-pointer"
                  >
                    <option value="all">All Pods</option>
                    {data?.teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name.replace(' (Fat Loss)', '').replace(' (Muscle Gain)', '').replace(' (Yoga & Wellness)', '')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table Well */}
              <div className="rounded-xl shadow-recessed bg-recessed/30 overflow-x-auto custom-scrollbar border border-black/5">
                <table className="w-full text-left border-collapse text-xxs">
                  <thead>
                    <tr className="bg-recessed/60 font-mono text-3xs text-muted-text uppercase border-b border-black/10">
                      <th className="p-3 font-bold">Advisor Name</th>
                      <th className="p-3 font-bold">Date Audited</th>
                      <th className="p-3 font-bold text-center">Discovery</th>
                      <th className="p-3 font-bold text-center">Objection</th>
                      <th className="p-3 font-bold text-center">Compliance</th>
                      <th className="p-3 font-bold text-center">Overall</th>
                      <th className="p-3 font-bold text-center">Flags</th>
                      <th className="p-3 font-bold text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center font-mono text-muted-text">
                          Retrieving data packages...
                        </td>
                      </tr>
                    ) : filteredAudits.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center font-mono text-muted-text">
                          No call audits found.
                        </td>
                      </tr>
                    ) : (
                      filteredAudits.map((audit) => {
                        const dateFormatted = new Date(audit.callDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        const hasHighFlags = audit.callFlags.some(f => f.severity === 'HIGH');
                        const isSelected = audit.id === selectedCallId;
                        
                        return (
                          <tr 
                            key={audit.id} 
                            onClick={() => setSelectedCallId(audit.id)}
                            className={`border-b border-black/5 hover:bg-recessed/45 cursor-pointer transition-all ${isSelected ? 'bg-recessed/65 font-bold' : ''}`}
                          >
                            <td className="p-3 flex flex-col">
                              <span className="font-bold text-primary-text">{audit.advisor.name}</span>
                              <span className="text-4xs text-muted-text font-mono uppercase">{audit.advisor.team.name.replace('Team ', '')}</span>
                            </td>
                            <td className="p-3 font-mono text-muted-text">{dateFormatted}</td>
                            <td className="p-3 text-center font-mono font-bold text-primary-text">{audit.needsDiscoveryScore}</td>
                            <td className="p-3 text-center font-mono font-bold text-primary-text">{audit.objectionHandlingScore}</td>
                            <td className="p-3 text-center font-mono font-bold">
                              <span className={audit.complianceScore < 50 ? 'text-red-500 font-extrabold' : 'text-primary-text'}>
                                {audit.complianceScore}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-extrabold text-xs text-primary-text">{audit.overallScore}%</td>
                            <td className="p-3 text-center">
                              {audit.callFlags.length > 0 ? (
                                <span className={`px-2 py-0.5 rounded-full font-mono text-4xs font-bold ${hasHighFlags ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
                                  {audit.callFlags.length} {hasHighFlags ? '🚨' : '⚠️'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full font-mono text-4xs font-bold bg-green-100 text-green-600 border border-green-200">OK</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                className={`px-2.5 py-1 rounded text-4xs font-mono font-bold border transition-all ${
                                  isSelected 
                                    ? 'bg-safety-orange border-safety-orange text-white shadow-orange-glow' 
                                    : 'bg-chassis border-white/50 text-primary-text shadow-card hover:bg-recessed'
                                }`}
                              >
                                {isSelected ? 'ACTIVE' : 'AUDIT'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Deep Dialer view */}
            {selectedCall && (
              <section className="rounded-2xl bg-chassis border border-white/40 shadow-card p-6 relative animate-slide-up">


                {/* Bezel header */}
                <div className="border-b border-black/10 pb-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full shadow-pressed bg-recessed text-safety-orange">
                      <Sliders className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-2xs font-mono font-bold tracking-wider text-muted-text uppercase">
                        DEEP DIALER VIEW & COACHING
                      </h2>
                      <div className="text-xs text-primary-text font-black mt-0.5">
                        {selectedCall.advisor.name} ({selectedCall.advisor.team.name.replace(' (Fat Loss)', '').replace(' (Muscle Gain)', '').replace(' (Yoga & Wellness)', '')}) — Score: {selectedCall.overallScore}%
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-4xs text-muted-text md:text-right">
                    <span>CALLID: {selectedCall.id.slice(0, 16)}</span>
                    <br />
                    <span>STAMP: {new Date(selectedCall.callDate).toLocaleString()}</span>
                  </div>
                </div>

                {/* Visual Audio Deck */}
                <div className="p-4 rounded-xl shadow-recessed bg-recessed/45 mb-6 flex flex-col md:flex-row items-center gap-5">
                  <button 
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      if (!isPlaying) setPlaybackTime(0);
                    }}
                    className={`h-11 w-11 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
                      isPlaying 
                        ? 'shadow-pressed bg-recessed border-black/5 text-safety-orange' 
                        : 'shadow-card bg-chassis border-white/50 text-primary-text hover:shadow-floating active:translate-y-[1px]'
                    }`}
                  >
                    {isPlaying ? (
                      <span className="flex gap-1 justify-center items-center">
                        <span className="w-1 h-4 bg-safety-orange rounded-full animate-pulse" />
                        <span className="w-1 h-4 bg-safety-orange rounded-full animate-pulse" />
                      </span>
                    ) : (
                      <span className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-primary-text ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between text-4xs font-mono text-muted-text uppercase font-bold">
                      <span>{formatSec(playbackTime)}</span>
                      <span>Signal Length: {selectedCall.duration}</span>
                    </div>
                    {/* Visual Sound Wavebars */}
                    <div className="h-6 flex items-end gap-[2px] w-full bg-recessed rounded p-1 shadow-pressed overflow-hidden">
                      {Array.from({ length: 64 }).map((_, idx) => {
                        const isPast = (idx / 64) * 200 < playbackTime;
                        // Random heights for waveform visual
                        const height = [40, 20, 60, 80, 50, 30, 70, 90, 40, 20, 60, 80, 55, 35, 75, 95, 30, 50, 70, 85, 45, 25, 65, 80, 35, 15, 55, 75, 40, 20, 60, 90, 50, 30, 70, 95, 40, 20, 65, 85, 30, 45, 60, 75, 35, 15, 50, 70, 40, 20, 60, 80, 50, 30, 70, 90, 40, 20, 60, 80, 55, 35, 75, 95][idx];
                        
                        return (
                          <div 
                            key={idx}
                            className={`flex-1 rounded-sm transition-all duration-300 ${
                              isPast ? 'bg-safety-orange shadow-orange-glow' : 'bg-muted-text/30'
                            }`}
                            style={{ 
                              height: `${height}%`,
                              animation: isPlaying && isPast ? 'soundwave 1.2s ease-in-out infinite' : 'none'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sub layout: transcript on left, flags on right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Diarized Transcript Panel (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="text-3xs font-mono font-bold text-muted-text uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-safety-orange" />
                      SPEAKER DIARIZED TRANSCRIPT
                    </h3>
                    
                    <div className="h-80 rounded-xl shadow-recessed bg-recessed/20 p-4 overflow-y-auto custom-scrollbar space-y-4 border border-black/5">
                      {(selectedCall.rawTranscript as any[]).map((line, idx) => {
                        const isAdvisor = line.speaker === 'Advisor';
                        const matchedFlag = selectedCall.callFlags.find(f => line.text.includes(f.quotedLine));
                        
                        return (
                          <div 
                            key={idx} 
                            className={`flex flex-col space-y-1 ${isAdvisor ? 'items-start' : 'items-end'}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-4xs font-mono text-muted-text">[{line.time}]</span>
                              <span className="text-3xs font-mono font-black text-primary-text uppercase">
                                {isAdvisor ? 'Advisor' : 'Customer'}
                              </span>
                            </div>
                            
                            <div className={`max-w-[85%] rounded-xl p-3.5 text-xxs leading-relaxed transition-all ${
                              matchedFlag 
                                ? matchedFlag.isContested
                                  ? 'bg-yellow-100/80 text-yellow-950 border border-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.15)] font-medium'
                                  : 'bg-red-100/80 text-red-950 border border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.15)] font-medium'
                                : isAdvisor 
                                  ? 'bg-panel border border-white/60 shadow-card text-primary-text' 
                                  : 'bg-recessed text-primary-text border border-black/5'
                            }`}>
                              {line.text}
                              
                              {matchedFlag && (
                                <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-4xs uppercase tracking-wider font-bold">
                                  <span className="flex items-center gap-1">
                                    <AlertTriangle className={`h-3 w-3 ${matchedFlag.isContested ? 'text-yellow-600' : 'text-red-500'}`} />
                                    {matchedFlag.category} — {matchedFlag.severity}
                                    {matchedFlag.isContested && ' (Contested Appeal)'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quality Audits Compliance Cards (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <h3 className="text-3xs font-mono font-bold text-muted-text uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-safety-orange" />
                      COMPLIANCE EXCEPTIONS
                    </h3>

                    <div className="h-80 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                      {selectedCall.callFlags.length === 0 ? (
                        <div className="p-6 rounded-xl border border-dashed border-black/10 text-center font-mono text-xs text-muted-text flex flex-col items-center justify-center h-full">
                          <CheckCircle2 className="h-7 w-7 text-green-600 mb-2" />
                          <span>EXCELLENT ADVISOR COMPLIANCE</span>
                          <span className="text-4xs text-muted-text mt-1">This call audit raised no warnings.</span>
                        </div>
                      ) : (
                        selectedCall.callFlags.map((flag) => (
                          <div 
                            key={flag.id} 
                            className={`p-4 rounded-xl border relative transition-all shadow-card hover:shadow-floating ${
                              flag.isContested 
                                ? 'bg-yellow-50/50 border-yellow-300/60'
                                : 'bg-red-50/50 border-red-300/60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-0.5 rounded-full font-mono text-4xs font-bold uppercase ${
                                flag.severity === 'HIGH' 
                                  ? 'bg-red-100 text-red-600 border border-red-200' 
                                  : 'bg-amber-100 text-amber-600 border border-amber-200'
                              }`}>
                                {flag.category} — {flag.severity}
                              </span>
                              <span className="text-4xs font-mono text-muted-text">{flag.timestampAnchor}</span>
                            </div>

                            <div className="text-xxs italic bg-white/40 p-2.5 rounded border border-black/5 text-primary-text mb-2 font-medium">
                              "{flag.quotedLine}"
                            </div>

                            <div className="text-xxs text-muted-text leading-normal mb-3 font-medium">
                              {flag.reason}
                            </div>

                            <button
                              onClick={() => handleContestFlag(flag.id)}
                              className={`w-full py-2.5 rounded-lg text-4xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                flag.isContested
                                  ? 'bg-yellow-500 text-white shadow-[0_2px_4px_rgba(234,179,8,0.3)] hover:bg-yellow-600'
                                  : 'bg-chassis text-primary-text border border-white/50 shadow-card hover:bg-recessed active:translate-y-[1px]'
                              }`}
                            >
                              <span>⚖️</span>
                              {flag.isContested ? 'CONTESTED (APPEAL FILED)' : 'CONTEST THIS AI FLAG'}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </section>
            )}

          </div>

        </div>

      </div>

      {/* ================= MODAL: INGEST / UPLOAD RECORDING ================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in glass-overlay">
          <div className="w-full max-w-[480px] bg-chassis border border-white/50 rounded-3xl shadow-floating p-6 relative overflow-hidden animate-slide-up">


            <div className="flex items-center justify-between border-b border-black/10 pb-3.5 mb-5 pl-2 pr-2">
              <h3 className="text-xs font-mono font-black text-primary-text uppercase flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-safety-orange" />
                INGEST TELEPHONY STREAM
              </h3>
              <button 
                onClick={() => setIsUploadOpen(false)}
                className="h-7 w-7 rounded-full shadow-card bg-chassis border border-white/50 flex items-center justify-center text-primary-text hover:bg-recessed active:shadow-pressed cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Ingestion screen */}
            <div className="carbon-pattern p-4 rounded-xl border border-black/80 flex flex-col gap-3 relative mb-5">
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-safety-orange animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              </div>
              <div className="text-4xs font-mono font-bold text-safety-orange tracking-widest uppercase">AUDIT ENGINE</div>
              <div className="h-16 rounded bg-black border border-neutral-800 shadow-inner scanlines p-2.5 font-mono flex flex-col justify-between overflow-hidden">
                {uploading ? (
                  <div className="text-4xs text-green-400 space-y-1.5">
                    <div className="animate-pulse">{uploadStatus}</div>
                    <div className="w-full bg-neutral-900 h-1.5 rounded overflow-hidden">
                      <div className="h-full bg-green-500 animate-ping" style={{ width: '100%' }} />
                    </div>
                  </div>
                ) : (
                  <div className="text-4xs text-neutral-400 space-y-0.5">
                    <div>CHANNEL: TELE-ADVISOR POD</div>
                    <div>STATUS: AWAITING RECORDING FILE</div>
                    <div className="text-neutral-500">FORMAT: MP3 / WAV WAVEFORM</div>
                  </div>
                )}
                <div className="flex justify-between text-4xs text-neutral-500 border-t border-neutral-900 pt-0.5">
                  <span>VOL: 100%</span>
                  <span>METER: AUTO</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleIngest} className="space-y-4 pl-2 pr-2">
              <div>
                <label className="block text-4xs font-mono font-bold text-muted-text uppercase mb-1.5">1. Assign Advisor Pod</label>
                <select
                  value={uploadAdvisorId}
                  onChange={(e) => setUploadAdvisorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-chassis border-none shadow-recessed font-mono text-xxs text-primary-text focus:outline-none focus:ring-1 focus:ring-safety-orange cursor-pointer"
                  required
                >
                  <option value="">-- Select Target Advisor --</option>
                  {data?.advisors.map((adv) => (
                    <option key={adv.id} value={adv.id}>
                      {adv.name} — {adv.team.name.replace('Team ', '')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-4xs font-mono font-bold text-muted-text uppercase mb-1.5">2. Choose Call Audio (.mp3/.wav)</label>
                <div className="p-4 rounded-xl shadow-recessed bg-recessed/35 flex flex-col items-center justify-center border border-dashed border-black/10 hover:bg-recessed/50 transition-all cursor-pointer relative">
                  <input 
                    id="audio-upload-input"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <UploadCloud className="h-7 w-7 text-muted-text mb-1.5" />
                  <span className="text-xxs text-primary-text font-bold text-center">
                    {uploadFile ? uploadFile.name : 'Select call recording...'}
                  </span>
                  <span className="text-4xs text-muted-text mt-0.5">MP3, WAV, or AAC format</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 rounded-xl bg-safety-orange text-white hover:brightness-110 active:scale-[0.98] active:shadow-pressed transition-all font-mono font-bold text-xs uppercase tracking-wider shadow-[4px_4px_8px_rgba(166,50,60,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Phone className="h-4 w-4" />
                {uploading ? 'INGESTING...' : 'CONFIRM INGESTION'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SEED RESET DATABASE ================= */}
      {isSeedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in glass-overlay">
          <div className="w-full max-w-[380px] bg-chassis border border-white/50 rounded-3xl shadow-floating p-6 relative overflow-hidden animate-slide-up">


            <div className="flex flex-col items-center text-center space-y-4 p-2">
              <div className="h-12 w-12 rounded-full shadow-pressed bg-recessed flex items-center justify-center text-safety-orange animate-bounce">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xs font-mono font-black text-primary-text uppercase">
                Reset Datasets?
              </h3>
              <p className="text-xxs text-muted-text font-semibold leading-relaxed">
                This will delete all simulated audits, call recordings, and appeals, restoring the FitNova database to its default initial pods.
              </p>
              
              <div className="flex items-center gap-4 w-full pt-2">
                <button
                  onClick={() => setIsSeedOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/50 bg-chassis text-primary-text font-mono text-xxs font-bold uppercase shadow-card hover:bg-recessed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetSeed}
                  disabled={seeding}
                  className="flex-1 py-2.5 rounded-lg bg-safety-orange text-white font-mono text-xxs font-bold uppercase shadow-[2px_2px_6px_rgba(255,71,87,0.3)] hover:brightness-110 active:scale-[0.98] cursor-pointer"
                >
                  {seeding ? 'RESETTING...' : 'RESET NOW'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

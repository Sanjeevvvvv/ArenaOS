'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getTranslation } from '@/lib/translations';
import { sendMessageToGemini, type ChatMessage } from '@/lib/gemini';
import { soundManager } from '@/lib/sounds';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  LayoutDashboard, 
  Sparkles, 
  Send, 
  ShieldAlert, 
  Activity, 
  Coins, 
  Users, 
  Lightbulb, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  KeyRound,
  FileText
} from 'lucide-react';

export default function OrganizerDashboard() {
  const { 
    metrics, 
    alerts, 
    emergencyActive, 
    toggleEmergency, 
    language 
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'weather' | 'ingress' | 'power'>('weather');
  const [isSimulating, setIsSimulating] = useState(false);
  
  // AI Briefing Output
  const [briefing, setBriefing] = useState<string>(
    '### Executive Briefing Console\nSelect a stadium scenario above and click "Run Strategy Simulation" to compile AI emergency directives.'
  );

  // Dual-Key authorization states
  const [key1Approved, setKey1Approved] = useState(false);
  const [key2Approved, setKey2Approved] = useState(false);

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute stats
  const ingressPercent = Math.min(100, Math.round((metrics.totalAttendance / 75000) * 100));
  const estimatedRevenue = Math.round(metrics.totalAttendance * 8.75); // $8.75 per attendee
  const carbonSavedTons = (metrics.waterRecycledLiters * 0.002 + metrics.energySolarPercent * 0.15).toFixed(1);

  const handleRunSimulation = async () => {
    soundManager.playClick();
    setIsSimulating(true);
    setBriefing('Compiling historical safety logs, ingress parameters, and grid nodes...');

    let scenarioText = '';
    if (selectedScenario === 'weather') {
      scenarioText = 'Severe Thunderstorm Warning. Lightning strike probability near the stadium within 15 minutes.';
    } else if (selectedScenario === 'ingress') {
      scenarioText = 'Peak Ingress Congestion at Gate 3 with over 4.5 people/m² density.';
    } else {
      scenarioText = 'Power Grid Interruption in Sector A affecting main elevators and digital wayfinding signs.';
    }

    const systemPrompt = `You are ArenaAI, the Stadium Operations Director Copilot. 
The current stadium stats are: Total Attendance: ${metrics.totalAttendance}, Gate Entry Rate: ${metrics.gateThroughput}/min, Green Solar Energy: ${metrics.energySolarPercent}%, Active Incidents: ${alerts.filter(a => a.status === 'active').length}. 
Emergency active state: ${emergencyActive ? 'ACTIVE STADIUM EVACUATION' : 'False'}.
The user's active language is: ${language.toUpperCase()}. You MUST reply in ${language.toUpperCase()} (either English, Spanish, or French).
Keep your advice highly executive, strategic, focusing on liability, crowd dispersion, and VIP routing. Use markdown headers and bullet points.`;

    try {
      const response = await sendMessageToGemini(
        [{ role: 'user', content: `Analyze this scenario and output an executive action plan: ${scenarioText}` }],
        systemPrompt,
        language
      );
      setBriefing(response);
      soundManager.playSuccess();
    } catch (err) {
      console.error(err);
      setBriefing('Failed to compile simulation briefing.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleEmergencyTrigger = () => {
    if (!key1Approved || !key2Approved) return;
    soundManager.playClick();
    toggleEmergency();
    // reset keys for safety
    setKey1Approved(false);
    setKey2Approved(false);
  };

  // Recharts mock data
  const revenueChartData = [
    { time: '17:00', Tickets: 150000, Food: 35000 },
    { time: '17:30', Tickets: 220000, Food: 65000 },
    { time: '18:00', Tickets: 350000, Food: 120000 },
    { time: '18:30', Tickets: 490000, Food: 180000 },
    { time: '19:00', Tickets: estimatedRevenue * 0.7, Food: estimatedRevenue * 0.3 }
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 bg-neutral-950 text-white min-h-[calc(100vh-4rem)] space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/30 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="text-amber-400 h-5 w-5" />
            Organizer HQ & Executive Intelligence Suite
          </h1>
          <p className="text-xs text-muted-foreground">High-level operations analytics, AI strategy simulations, and master overrides.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="rounded-2xl glass-panel p-5 border border-border/30 text-left space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 blur-xl rounded-full"></div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold">Stadium Ingress</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold mt-1 tracking-tight">{ingressPercent}%</div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${ingressPercent}%` }}></div>
          </div>
          <span className="text-[9px] text-neutral-400">Capacity threshold: 75,000</span>
        </div>

        <div className="rounded-2xl glass-panel p-5 border border-border/30 text-left space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 blur-xl rounded-full"></div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold">Projected Revenue</span>
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold mt-1 tracking-tight">${estimatedRevenue.toLocaleString()}</div>
          <span className="text-[9px] text-emerald-400 font-semibold">Ticket & Dining combined</span>
        </div>

        <div className="rounded-2xl glass-panel p-5 border border-border/30 text-left space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 blur-xl rounded-full"></div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold">Carbon Offset</span>
            <Lightbulb className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold mt-1 tracking-tight">{carbonSavedTons} Tons</div>
          <span className="text-[9px] text-amber-400 font-semibold">Solar & graywater savings</span>
        </div>

        <div className="rounded-2xl glass-panel p-5 border border-border/30 text-left space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 blur-xl rounded-full"></div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] uppercase font-semibold">VIP Occupancy</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold mt-1 tracking-tight">92%</div>
          <span className="text-[9px] text-neutral-400">All suites reporting secure status</span>
        </div>

      </div>

      {/* Main Grid: AI Strategy Simulation on Left (8 cols) & Master Evac Override on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: What-If Strategy Center */}
        <div className="lg:col-span-8 rounded-2xl glass-panel p-5 border border-border/30 space-y-4 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/30 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                AI "What-If" Strategy Center
              </h3>
              <p className="text-[10px] text-muted-foreground">Run emergency stadium stress tests to receive Gemini strategic directives.</p>
            </div>
            
            {/* Scenario selector & Run button */}
            <div className="flex gap-2">
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value as any)}
                className="bg-neutral-900 border border-border/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="weather">Scenario: Severe Weather</option>
                <option value="ingress">Scenario: Gate Bottleneck</option>
                <option value="power">Scenario: Power Failure</option>
              </select>
              
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
              </button>
            </div>
          </div>

          {/* AI Strategy Output briefing box */}
          <div className="flex-1 bg-neutral-950 border border-border/30 rounded-xl p-4 font-mono text-xs text-neutral-200 leading-relaxed overflow-y-auto min-h-[260px] text-left select-text relative">
            <div className="absolute top-3 right-3 z-10 text-[9px] font-sans text-neutral-500 bg-neutral-950/80 px-2 py-0.5 rounded border border-border/30">
              FIFA DIRECTIVE STRATEGY // {language.toUpperCase()}
            </div>
            
            {isSimulating ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/3"></div>
                <div className="h-3 bg-white/5 rounded w-full"></div>
                <div className="h-3 bg-white/5 rounded w-5/6"></div>
                <div className="h-3 bg-white/5 rounded w-4/5"></div>
              </div>
            ) : (
              <div className="whitespace-pre-line prose prose-invert space-y-1">
                {briefing}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Dual-Key Executive Override Control */}
        <div className="lg:col-span-4 rounded-2xl glass-panel p-5 border border-border/30 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5 border-b border-border/30 pb-2">
              <KeyRound className="h-4 w-4" />
              Dual-Key Executive override
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1">Requires dual-key security credentials to toggle global emergency evacuation broadcasts.</p>
          </div>

          {/* Keys Checklist */}
          <div className="space-y-3 py-3 text-left">
            <div 
              onClick={() => { soundManager.playClick(); setKey1Approved(!key1Approved); }}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                key1Approved ? 'bg-amber-950/20 border-amber-500/30' : 'bg-neutral-900 border-border/30 hover:bg-neutral-900'
              }`}
            >
              <input
                type="checkbox"
                checked={key1Approved}
                readOnly
                className="rounded border-white/20 bg-neutral-950 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
              />
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wide">Key 1: Director Authentication</div>
                <div className="text-[9px] text-muted-foreground">Verifies FIFA organizing chairman signature.</div>
              </div>
            </div>

            <div 
              onClick={() => { soundManager.playClick(); setKey2Approved(!key2Approved); }}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                key2Approved ? 'bg-amber-950/20 border-amber-500/30' : 'bg-neutral-900 border-border/30 hover:bg-neutral-900'
              }`}
            >
              <input
                type="checkbox"
                checked={key2Approved}
                readOnly
                className="rounded border-white/20 bg-neutral-950 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
              />
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wide">Key 2: Security Chief Auth</div>
                <div className="text-[9px] text-muted-foreground">Verifies local safety director authorization.</div>
              </div>
            </div>
          </div>

          {/* Override Trigger Button */}
          <div>
            <button
              onClick={handleEmergencyTrigger}
              disabled={!key1Approved || !key2Approved}
              className={`w-full py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase transition cursor-pointer border ${
                emergencyActive 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30' 
                  : 'bg-red-600 hover:bg-red-500 text-white border-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed neon-glow-red'
              }`}
            >
              {emergencyActive ? 'SILENCE EMERGENCY SIREN' : 'LAUNCH GLOBAL EVACUATION'}
            </button>
            <div className="text-[9px] text-muted-foreground text-center mt-2">
              🚨 Triggering evacuation loops sweeps dual-sawtooth sirens stadium-wide.
            </div>
          </div>
        </div>

      </div>

      {/* Executive Revenue Analytics (Recharts Area Graph) */}
      <div className="rounded-2xl glass-panel p-5 space-y-4 border border-border/30">
        <div className="text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-cyan-400" />
            Executive Revenue & Concessions Trend
          </h3>
          <p className="text-[10px] text-muted-foreground">Cumulative cash flows from ticket gates vs dining stands.</p>
        </div>

        <div className="h-64 w-full text-xs">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="ticketGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="diningGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="time" stroke="#71717a" fontSize={9} />
                <YAxis stroke="#71717a" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Tickets" stroke="#d97706" fillOpacity={1} fill="url(#ticketGlow)" name="Ticket Sales ($)" />
                <Area type="monotone" dataKey="Food" stroke="#06b6d4" fillOpacity={1} fill="url(#diningGlow)" name="Concessions ($)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>
          )}
        </div>
      </div>

    </div>
  );
}

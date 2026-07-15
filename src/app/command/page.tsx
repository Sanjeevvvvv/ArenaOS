'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { StadiumMap } from '@/components/map/StadiumMap';
import { sendMessageToGemini, type ChatMessage } from '@/lib/gemini';
import { soundManager } from '@/lib/sounds';
import { getTranslation } from '@/lib/translations';
import { 
  ShieldAlert, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Video,
  Terminal,
  Activity,
  Volume2,
  VolumeX,
  Compass
} from 'lucide-react';

export default function CommandCenter() {
  const { 
    alerts, 
    updateAlertStatus, 
    resolveAlert, 
    addAlert,
    metrics, 
    emergencyActive, 
    language
  } = useAppStore();

  const [mapMode, setMapMode] = useState<'standard' | 'heatmap' | 'accessibility'>('heatmap');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || null;
  
  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: '### Welcome to ArenaOS Command AI\nI am connected to stadium sensory nodes. You can ask me to analyze flow congestion, run incident simulations, or assist in emergency redirect plans.'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);


  // CCTV camera simulator states
  const [activeCam, setActiveCam] = useState<'CAM-01' | 'CAM-02' | 'CAM-03' | 'CAM-04'>('CAM-01');
  const cameraLabels = {
    'CAM-01': 'Gate 3 Ingress Corridor',
    'CAM-02': 'Sector D Seating Bowl',
    'CAM-03': 'Concourse level 2 Food Hub',
    'CAM-04': 'North Pitch Exit Ramp'
  };

  // Terminal log console states
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] SYSTEM: ArenaOS v1.0.4 initialized.`,
    `[${new Date().toLocaleTimeString()}] SENSOR: Threat matrix scanning online.`,
    `[${new Date().toLocaleTimeString()}] CLOUD: Connection to Vercel Edge nodes established.`,
    `[${new Date().toLocaleTimeString()}] SENSOR: Spectator gate readers reporting normal load.`
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Audio mute state
  const [isMuted, setIsMuted] = useState(() => typeof window !== 'undefined' ? soundManager.isMuted() : false);

  // Update terminal logs during metrics changes (ticks)
  useEffect(() => {
    const time = new Date().toLocaleTimeString();
    const newLogEntry = `[${time}] TELEMETRY: Ingress velocity is ${metrics.gateThroughput} p/m. Attendance: ${metrics.totalAttendance.toLocaleString()}. Solar Grid: ${metrics.energySolarPercent}%.`;
    const timer = setTimeout(() => {
      setLogs((prev) => [...prev.slice(-30), newLogEntry]); // keep last 30 entries
    }, 0);
    return () => clearTimeout(timer);
  }, [metrics]);

  // Update terminal logs when alerts change
  useEffect(() => {
    const time = new Date().toLocaleTimeString();
    const activeAlerts = alerts.filter(a => a.status === 'active');
    if (activeAlerts.length > 0) {
      const newLogEntry = `[${time}] WARNING: ${activeAlerts.length} unresolved safety alert(s) in database. Check radar coordinates.`;
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev.slice(-30), newLogEntry]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  // Auto-scroll chat and logs
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSendChat = async (text: string) => {
    if (!text.trim()) return;
    
    soundManager.playClick();
    const userMsg: ChatMessage = { role: 'user', content: text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    const systemPrompt = `You are ArenaAI, the Senior Decision Support Copilot in the ArenaOS Stadium Command Center. 
The current stadium stats are: Total Attendance: ${metrics.totalAttendance}, Gate Entry Rate: ${metrics.gateThroughput}/min, Green Solar Energy: ${metrics.energySolarPercent}%, Active Incidents count: ${alerts.filter(a => a.status === 'active').length}. 
Emergency active state: ${emergencyActive ? 'ACTIVE STADIUM EVACUATION' : 'False'}.
The user's active language is: ${language.toUpperCase()}. You MUST translate all your output responses and reports into the requested language (English/Spanish/French).
Keep your advice highly tactical, structured, and geared toward security staff. Use bullet points and action labels.`;

    try {
      const response = await sendMessageToGemini([...chatMessages, userMsg], systemPrompt, language);
      setChatMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateMockIncident = () => {
    const types: ('security' | 'medical' | 'crowd' | 'facility')[] = ['security', 'medical', 'crowd', 'facility'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    
    const randomIncidents = {
      security: {
        title: 'Unauthorized Entry Gate 6',
        description: 'Spectator attempted tailgating through Gate 6 VIP service corridor.',
        location: 'Gate 6 VIP Entry',
        severity: 'medium' as const,
        coordinates: { x: 25, y: 35 }
      },
      medical: {
        title: 'Fainting incident Sector E',
        description: 'Volunteer reports elderly fan fainted near beverage stall 14. First aid needed.',
        location: 'Level 1, Sector E',
        severity: 'high' as const,
        coordinates: { x: 12, y: 70 }
      },
      crowd: {
        title: 'Crowd Bottleneck Concourse 2',
        description: 'Halftime exit flow stalling near exit escalator Sector C.',
        location: 'Sector C Escalators',
        severity: 'high' as const,
        coordinates: { x: 88, y: 62 }
      },
      facility: {
        title: 'Elevator 4 Power Outage',
        description: 'Sensor reports mechanical grid trip in Lift 4. Technicians notified.',
        location: 'Elevator Shaft 4, Sector A',
        severity: 'medium' as const,
        coordinates: { x: 26, y: 22 }
      }
    };

    const details = randomIncidents[selectedType];
    addAlert({
      type: selectedType,
      title: details.title,
      description: details.description,
      location: details.location,
      severity: details.severity,
      status: 'active',
      coordinates: details.coordinates
    });

    // Auto-select the newly created alert
    setTimeout(() => {
      const latest = useAppStore.getState().alerts[0];
      if (latest) {
        setSelectedAlertId(latest.id);
      }
    }, 50);
  };


  const toggleMute = () => {
    const nextMute = soundManager.toggleMute();
    setIsMuted(nextMute);
  };

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');

  return (
    <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-4 sm:p-6 bg-neutral-950 text-white min-h-[calc(100vh-4rem)]">
      
      {/* LEFT COLUMN: Dynamic Sensor Grid & scrollable Terminal Console (3 cols) */}
      <div className="xl:col-span-3 flex flex-col gap-6 h-full max-h-[calc(100vh-6rem)] overflow-y-auto">
        
        {/* Widescreen Status Telemetry Grid */}
        <div className="rounded-2xl glass-panel p-5 space-y-4 border border-border/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 blur-2xl rounded-full"></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-border/30 pb-2">
            <Activity className="h-4 w-4" />
            {getTranslation(language, 'sensorGrid')}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-900/60 border border-border/30 rounded-xl text-left">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Load</div>
              <div className="text-xl font-bold mt-1 tracking-tight">{metrics.totalAttendance.toLocaleString()}</div>
              <span className="text-[9px] text-neutral-400">Processed seats</span>
            </div>

            <div className="p-3 bg-neutral-900/60 border border-border/30 rounded-xl text-left">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Inflow Rate</div>
              <div className="text-xl font-bold text-cyan-400 mt-1 tracking-tight">+{metrics.gateThroughput}/m</div>
              <span className="text-[9px] text-cyan-500 font-semibold animate-pulse">Live entry scan</span>
            </div>

            <div className="p-3 bg-neutral-900/60 border border-border/30 rounded-xl text-left">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Decibel Level</div>
              <div className="text-xl font-bold mt-1 tracking-tight text-amber-400">{metrics.noiseLevelDb} dB</div>
              <span className="text-[9px] text-amber-500 font-semibold">High ambient noise</span>
            </div>

            <div className="p-3 bg-neutral-900/60 border border-border/30 rounded-xl text-left">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Solar energy</div>
              <div className="text-xl font-bold mt-1 tracking-tight text-emerald-400">{metrics.energySolarPercent}%</div>
              <span className="text-[9px] text-emerald-500">Green credits active</span>
            </div>
          </div>
        </div>

        {/* Live system terminal logs */}
        <div className="flex-1 rounded-2xl glass-panel p-5 flex flex-col gap-3 border border-border/30 min-h-[300px]">
          <div className="flex justify-between items-center border-b border-border/30 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-emerald-400 animate-pulse" />
              {getTranslation(language, 'terminalLog')}
            </h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          {/* Dev-style console */}
          <div className="flex-1 bg-neutral-950 border border-border/30 rounded-xl p-3 font-mono text-[10px] text-emerald-400 leading-relaxed overflow-y-auto h-64 select-text">
            {logs.map((log, index) => (
              <div key={index} className="border-b border-border/30 pb-1 mb-1 text-left whitespace-pre-wrap">
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

      </div>

      {/* CENTER COLUMN: Radar map and CCTV simulator cockpit (6 cols) */}
      <div className="xl:col-span-6 flex flex-col gap-6 h-full max-h-[calc(100vh-6rem)] overflow-y-auto">
        
        {/* Radar Map view */}
        <div className="rounded-2xl glass-panel p-5 flex flex-col gap-4 border border-border/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Compass className="h-5 w-5 text-cyan-400 animate-spin-slow" />
                Live Tactical Operations Map
              </h2>
              <p className="text-xs text-muted-foreground">Coordinates radar overlay. Click alerts to target medical or security vectors.</p>
            </div>
            
            {/* Map Mode Buttons */}
            <div className="flex gap-1 bg-neutral-900 border border-border/40 rounded-lg p-1 text-xs font-semibold">
              <button
                onClick={() => { soundManager.playClick(); setMapMode('standard'); }}
                className={`px-3 py-1.5 rounded-md transition ${
                  mapMode === 'standard' ? 'bg-primary text-black font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Layout
              </button>
              <button
                onClick={() => { soundManager.playClick(); setMapMode('heatmap'); }}
                className={`px-3 py-1.5 rounded-md transition ${
                  mapMode === 'heatmap' ? 'bg-primary text-black font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Crowd
              </button>
              <button
                onClick={() => { soundManager.playClick(); setMapMode('accessibility'); }}
                className={`px-3 py-1.5 rounded-md transition ${
                  mapMode === 'accessibility' ? 'bg-primary text-black font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Access
              </button>
            </div>
          </div>

          <StadiumMap 
            viewMode={mapMode} 
            onSelectAlert={(alt) => setSelectedAlertId(alt.id)}
          />
        </div>

        {/* CCTV Camera Simulator Feed */}
        <div className="rounded-2xl glass-panel p-5 border border-border/30 space-y-4">
          <div className="flex justify-between items-center border-b border-border/30 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <Video className="h-4 w-4" />
              {getTranslation(language, 'cctvFeed')}
            </h3>
            
            {/* Camera selectors */}
            <div className="flex gap-1 text-[10px] font-bold">
              {['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04'].map((cam) => (
                <button
                  key={cam}
                  onClick={() => { soundManager.playClick(); setActiveCam(cam as 'CAM-01' | 'CAM-02' | 'CAM-03' | 'CAM-04'); }}
                  className={`px-2 py-1 rounded border transition ${
                    activeCam === cam 
                      ? 'bg-rose-950/40 border-rose-500 text-rose-400 font-bold' 
                      : 'border-border/30 bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  {cam}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive CCTV Screen box */}
          <div className="relative h-44 bg-neutral-950 rounded-xl overflow-hidden border border-border/40 flex items-center justify-center">
            
            {/* Animated scanlines filter */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10"></div>
            
            {/* Static grain effect */}
            <div className="absolute inset-0 bg-neutral-900/10 pointer-events-none opacity-20 z-10 animate-pulse"></div>

            {/* Video overlay indicators */}
            <div className="absolute top-3 left-3 z-20 text-[9px] font-mono text-emerald-400 tracking-wider bg-neutral-950/80 px-2 py-0.5 rounded border border-border/30">
              {"REC // "}{activeCam}{" // "}{cameraLabels[activeCam]}
            </div>

            <div className="absolute top-3 right-3 z-20 text-[9px] font-mono text-emerald-400 bg-neutral-950/80 px-2 py-0.5 rounded border border-border/30">
              {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
            </div>

            <div className="absolute bottom-3 left-3 z-20 text-[9px] font-mono text-rose-500 flex items-center gap-1 bg-neutral-950/80 px-2 py-0.5 rounded border border-border/30 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              LIVE FEED
            </div>

            {/* Visual simulation content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center select-none p-4 text-center">
              
              {/* Graphic grid targeting circle */}
              <div className="h-20 w-20 border border-emerald-500/20 rounded-full flex items-center justify-center relative animate-pulse-slow">
                <span className="absolute h-4 w-0.5 bg-emerald-500/40 -top-2"></span>
                <span className="absolute h-4 w-0.5 bg-emerald-500/40 -bottom-2"></span>
                <span className="absolute w-4 h-0.5 bg-emerald-500/40 -left-2"></span>
                <span className="absolute w-4 h-0.5 bg-emerald-500/40 -right-2"></span>
                <span className="text-[10px] text-emerald-500/30 font-bold uppercase tracking-wider">Lock</span>
              </div>
              
              <div className="text-[10px] text-neutral-400 font-mono mt-3 max-w-[280px] leading-tight">
                Ingress throughput processing at standard safety velocity. Thermal scanners reporting negative threats.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: AI Chat & Actionable alert feed (3 cols) */}
      <div className="xl:col-span-3 flex flex-col gap-6 h-full max-h-[calc(100vh-6rem)] overflow-y-auto">
        
        {/* Incident Warning Board */}
        <div className="rounded-2xl glass-panel p-5 border border-border/30 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border/30 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              {getTranslation(language, 'securityFeed')} ({activeAlerts.length})
            </h3>
            <button
              onClick={handleCreateMockIncident}
              className="text-[9px] px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 border border-border/40 transition font-semibold"
            >
              + Trigger mock
            </button>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col justify-center items-center text-center text-xs text-muted-foreground py-6 space-y-1">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                <span>{getTranslation(language, 'threatCleared')}</span>
              </div>
            ) : (
              activeAlerts.map((alt) => (
                <div 
                  key={alt.id}
                  onClick={() => { soundManager.playClick(); setSelectedAlertId(alt.id); }}
                  className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                    selectedAlertId === alt.id 
                      ? 'bg-rose-950/20 border-rose-500' 
                      : 'bg-neutral-900/60 border-border/30 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      alt.severity === 'critical' || alt.severity === 'high' ? 'bg-red-950/80 text-red-400' : 'bg-amber-950/80 text-amber-400'
                    }`}>
                      {alt.severity}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{alt.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs mt-1.5 line-clamp-1">{alt.title}</h4>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                    <span className="text-[9px] text-neutral-400">Loc: {alt.location}</span>
                    <div className="flex gap-1">
                      {alt.status === 'active' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateAlertStatus(alt.id, 'in-progress');
                          }}
                          className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                        >
                          Ack
                        </button>
                      )}
                      {alt.status === 'in-progress' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveAlert(alt.id);
                            if (selectedAlertId === alt.id) setSelectedAlertId(null);
                          }}
                          className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Alert Details Panel */}
          {selectedAlert && (
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-rose-500/40 text-left space-y-2.5 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center border-b border-border/30 pb-1.5">
                <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1 text-[9px]">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                  Incident Info & Dispatch
                </h4>
                <button 
                  onClick={() => setSelectedAlertId(null)}
                  className="text-[10px] text-neutral-400 hover:text-white font-medium"
                >
                  Close
                </button>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-white text-xs leading-snug">{selectedAlert.title}</span>
                  <span className={`text-[8px] px-1.5 py-0.2 rounded font-black uppercase shrink-0 ${
                    selectedAlert.severity === 'critical' || selectedAlert.severity === 'high' ? 'bg-red-950/80 text-red-400 border border-red-500/20' : 'bg-amber-950/80 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedAlert.severity}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-300 leading-relaxed pt-0.5">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] text-neutral-400 pt-2 border-t border-border/30">
                <div>Loc: <span className="text-white font-semibold">{selectedAlert.location}</span></div>
                <div>Coords: <span className="text-cyan-400 font-mono font-bold">X:{selectedAlert.coordinates.x.toFixed(0)}% Y:{selectedAlert.coordinates.y.toFixed(0)}%</span></div>
                <div>Status: <span className={`font-bold capitalize ${selectedAlert.status === 'active' ? 'text-red-400' : 'text-amber-400'}`}>{selectedAlert.status}</span></div>
                <div>Reported: <span className="text-white">{selectedAlert.timestamp}</span></div>
              </div>

              <div className="flex gap-2 justify-end pt-1.5">
                {selectedAlert.status === 'active' && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      updateAlertStatus(selectedAlert.id, 'in-progress');
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition text-[9px] font-bold"
                  >
                    Acknowledge Incident
                  </button>
                )}
                {selectedAlert.status === 'in-progress' && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      resolveAlert(selectedAlert.id);
                      setSelectedAlertId(null);
                    }}
                    className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition text-[9px] font-bold"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Gemini Decision Chatbot console */}
        <div className="flex-1 rounded-2xl glass-panel p-5 border border-border/30 flex flex-col gap-3 min-h-[300px]">
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 animate-glow" />
                {getTranslation(language, 'aiCopilotTitle')}
              </h3>
            </div>
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-red-500 cursor-pointer" onClick={toggleMute} />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-cyan-400 cursor-pointer" onClick={toggleMute} />
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[90%] rounded-xl px-3 py-2 leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-black font-semibold rounded-tr-none' 
                    : 'bg-neutral-900 text-neutral-200 border border-border/30 rounded-tl-none prose prose-invert'
                }`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="whitespace-pre-line space-y-1 text-[11px]">
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 italic">
                <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                Compiling decision suggestions...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Form Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat(chatInput);
            }}
            className="flex gap-2 border-t border-border/30 pt-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Query copilot..."
              className="flex-1 bg-neutral-900 border border-border/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-1.5 bg-primary text-black hover:bg-primary/95 disabled:opacity-50 rounded-xl transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

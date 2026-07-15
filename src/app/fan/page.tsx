'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { StadiumMap } from '@/components/map/StadiumMap';
import { soundManager } from '@/lib/sounds';
import { findOptimalTransitRoute } from '@/lib/transit';
import { 
  HeartHandshake, 
  Accessibility, 
  AlertTriangle, 
  Compass, 
  Train, 
  Bus, 
  Car, 
  Check,
  Info
} from 'lucide-react';
import { getTranslation } from '@/lib/translations';

export default function FanPortal() {
  const { 
    addAlert, 
    transit, 
    concessions,
    accessibilityMode, 
    setAccessibilityMode,
    sensoryMapMode,
    setSensoryMapMode,
    audioGuideActive,
    setAudioGuideActive,
    highContrastMode,
    setHighContrastMode,
    language
  } = useAppStore();

  const [mapMode, setMapMode] = useState<'standard' | 'accessibility'>('accessibility');
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosType, setSosType] = useState<'medical' | 'security'>('medical');
  const [sosDetails, setSosDetails] = useState('');
  const [sosLocation, setSosLocation] = useState('Section 114');
  const [sosSuccess, setSosSuccess] = useState(false);

  const handleSOSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (typeof window !== 'undefined') {
      soundManager.playSOS();
    }
    
    // Dispatch alert to AI Command Center
    addAlert({
      type: sosType,
      title: `SOS Request (${sosType.toUpperCase()})`,
      description: `Fan emergency report: "${sosDetails || 'No details provided'}". Seating location: ${sosLocation}.`,
      location: `Lower Bowl, ${sosLocation}`,
      severity: 'critical',
      status: 'active',
      coordinates: { x: 45 + Math.random() * 10, y: 45 + Math.random() * 10 }
    });

    setSosSuccess(true);
    setTimeout(() => {
      setSosTriggered(false);
      setSosSuccess(false);
      setSosDetails('');
    }, 4500);
  };

  const getTransitIcon = (type: string) => {
    switch (type) {
      case 'train':
      case 'metro': return <Train className="h-4 w-4 text-cyan-400" />;
      case 'bus': return <Bus className="h-4 w-4 text-amber-400" />;
      default: return <Car className="h-4 w-4 text-emerald-400" />;
    }
  };

  const recommendedTransit = findOptimalTransitRoute(transit) || transit[0];

  const panelClass = highContrastMode 
    ? "rounded-2xl bg-black border-4 border-yellow-400 p-5 space-y-4 text-yellow-400 font-bold shadow-none" 
    : "rounded-2xl glass-panel p-5 space-y-4 border border-white/5";

  const textMutedClass = highContrastMode ? "text-white font-bold" : "text-xs text-muted-foreground";
  const textTitleClass = highContrastMode ? "text-yellow-400 font-black text-xl" : "text-lg font-bold text-white tracking-tight";
  const listItemClass = highContrastMode 
    ? "p-3 rounded-xl bg-black border-2 border-yellow-400 text-yellow-400 font-bold" 
    : "p-3 rounded-xl bg-neutral-900 border border-white/5";

  return (
    <div className={`flex-1 p-4 sm:p-6 min-h-[calc(100vh-4rem)] space-y-6 transition-colors duration-300 ${
      highContrastMode ? 'bg-black text-yellow-400 font-bold border-4 border-yellow-400' : 'bg-neutral-950 text-white'
    }`}>
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Compass className="text-cyan-400 h-5 w-5 animate-pulse" />
            ArenaOS Fan Portal & Wayfinding
          </h1>
          <p className="text-xs text-muted-foreground">Access live transit connections, express food pre-ordering, and emergency dispatch tracking.</p>
        </div>

        {/* SOS Emergency button */}
        <button
          onClick={() => { soundManager.playClick(); setSosTriggered(true); }}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-500 hover:scale-102 active:scale-98 text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition cursor-pointer shadow-lg neon-glow-red"
        >
          <AlertTriangle className="h-4 w-4 animate-bounce" />
          <span>{getTranslation(language, 'emergencySos')}</span>
        </button>
      </div>

      {/* SOS Alert Trigger Modal overlay */}
      {sosTriggered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="max-w-md w-full glass-panel rounded-2xl p-6 border border-red-500/30 text-left space-y-4 animate-in zoom-in-95">
            {sosSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">SOS Active</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your coordinates and ticket info have been dispatched to Security HQ. First aid stewards have been routed to Section 114.
                </p>
                <div className="text-[10px] text-cyan-400 font-mono tracking-wider animate-pulse">LOCK COORDINATES: {sosLocation}</div>
              </div>
            ) : (
              <form onSubmit={handleSOSSubmit} className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    Activate Distress Call
                  </h3>
                  <button 
                    type="button"
                    onClick={() => { soundManager.playClick(); setSosTriggered(false); }}
                    className="text-xs text-muted-foreground hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-semibold text-muted-foreground">Emergency Class</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { soundManager.playClick(); setSosType('medical'); }}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        sosType === 'medical' 
                          ? 'bg-red-950/60 border-red-500 text-red-400' 
                          : 'border-white/5 bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Medical Emergency
                    </button>
                    <button
                      type="button"
                      onClick={() => { soundManager.playClick(); setSosType('security'); }}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        sosType === 'security' 
                          ? 'bg-red-950/60 border-red-500 text-red-400' 
                          : 'border-white/5 bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Security Threat
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Concourses / Seating Area *</label>
                    <input
                      type="text"
                      required
                      value={sosLocation}
                      onChange={(e) => setSosLocation(e.target.value)}
                      placeholder="e.g. Section 114 Row 12 Seat 5"
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">Distress Details</label>
                    <textarea
                      value={sosDetails}
                      onChange={(e) => setSosDetails(e.target.value)}
                      placeholder="Describe symptoms or active threats..."
                      className="w-full h-16 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition cursor-pointer"
                >
                  Broadcast Emergency SOS
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Map & Accessibility Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className={panelClass}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className={textTitleClass}>Smart Stadium Indoor Guide</h2>
                <p className={textMutedClass}>Select access overlays or general layout vectors for gate navigation.</p>
              </div>

              {/* Map Layer control */}
              <div className="flex bg-neutral-900 border border-white/10 rounded-lg p-1 text-xs font-semibold">
                <button
                  onClick={() => { soundManager.playClick(); setMapMode('standard'); }}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    mapMode === 'standard' ? 'bg-primary text-black font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => { soundManager.playClick(); setMapMode('accessibility'); }}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    mapMode === 'accessibility' ? 'bg-primary text-black font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Accessible Layer
                </button>
              </div>
            </div>

            <StadiumMap viewMode={mapMode} />
          </div>

          {/* Accessibility controls Panel */}
          <div className={panelClass}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Accessibility className="h-4 w-4" />
              {getTranslation(language, 'accessibilitySuite')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              <button
                onClick={() => {
                  soundManager.playClick();
                  setAccessibilityMode(!accessibilityMode);
                }}
                className={`p-4 rounded-2xl border text-left space-y-2 transition cursor-pointer ${
                  accessibilityMode 
                    ? 'bg-cyan-950/20 border-cyan-500' 
                    : 'bg-neutral-900 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="text-xs font-bold text-white">{getTranslation(language, 'stepFree')}</div>
                <p className="text-[10px] text-muted-foreground leading-tight">Elevator paths and step-free stadium entry guides.</p>
                <div className="text-[10px] font-semibold text-cyan-400 mt-1">
                  {accessibilityMode ? 'Active / Filtering' : 'Disabled'}
                </div>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setSensoryMapMode(!sensoryMapMode);
                }}
                className={`p-4 rounded-2xl border text-left space-y-2 transition cursor-pointer ${
                  sensoryMapMode 
                    ? 'bg-emerald-950/20 border-emerald-500' 
                    : 'bg-neutral-900 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="text-xs font-bold text-white">{getTranslation(language, 'sensoryFriendly')}</div>
                <p className="text-[10px] text-muted-foreground leading-tight">Highlights low-noise sections and sensory rest areas.</p>
                <div className="text-[10px] font-semibold text-emerald-400 mt-1">
                  {sensoryMapMode ? 'Active / Showing Zones' : 'Disabled'}
                </div>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setAudioGuideActive(!audioGuideActive);
                }}
                className={`p-4 rounded-2xl border text-left space-y-2 transition cursor-pointer ${
                  audioGuideActive 
                    ? 'bg-amber-950/20 border-amber-500' 
                    : 'bg-neutral-900 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="text-xs font-bold text-white">{getTranslation(language, 'audioDescription')}</div>
                <p className="text-[10px] text-muted-foreground leading-tight">Activates audio-described commentaries on FM 98.7.</p>
                <div className="text-[10px] font-semibold text-amber-400 mt-1">
                  {audioGuideActive ? 'Active / FM 98.7 Stream' : 'Disabled'}
                </div>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setHighContrastMode(!highContrastMode);
                }}
                className={`p-4 rounded-2xl border text-left space-y-2 transition cursor-pointer ${
                  highContrastMode 
                    ? 'bg-purple-950/20 border-purple-500' 
                    : 'bg-neutral-900 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="text-xs font-bold text-white">{getTranslation(language, 'highContrast')}</div>
                <p className="text-[10px] text-muted-foreground leading-tight">High visibility coloring and larger sizing indicators.</p>
                <div className="text-[10px] font-semibold text-purple-400 mt-1">
                  {highContrastMode ? 'Active' : 'Disabled'}
                </div>
              </button>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Transit Planner & Dining queue tips (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Smart Transit Board */}
          <div className={panelClass}>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Train className="h-4 w-4 text-cyan-400" />
                {getTranslation(language, 'transitDepartures')}
              </h3>
              <p className={textMutedClass}>Outward shuttle schedules and gate flow congestion levels.</p>
            </div>

            <div className="space-y-3">
              {transit.map((trn) => (
                <div key={trn.id} className={`${listItemClass} flex justify-between items-center text-left`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-950 rounded-lg">
                      {getTransitIcon(trn.type)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white uppercase tracking-wide">{trn.line}</div>
                      <div className={textMutedClass}>To: {trn.destination}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">in {trn.nextArrival} mins</div>
                    <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase ${
                      trn.status === 'delayed' ? 'bg-red-950/85 text-red-400 border border-red-500/20' : trn.status === 'crowded' ? 'bg-amber-950/85 text-amber-400 border border-amber-500/20' : 'bg-emerald-950/85 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {trn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Travel Suggestion */}
            {recommendedTransit && (
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/25 flex gap-2.5 text-left">
                <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">AI Travel Advisory</h4>
                  <p className="text-[10px] text-neutral-300 mt-1 leading-relaxed">
                    Transit planners report parking delays. We recommend the **{recommendedTransit.line}** which is currently running **{recommendedTransit.status}**.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Concession Stands */}
          <div className={panelClass}>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-white/5 pb-2">
                <HeartHandshake className="h-4 w-4 text-emerald-400" />
                Concession line times
              </h3>
              <p className={textMutedClass}>Check lines and pre-order via express checkout.</p>
            </div>

            <div className="space-y-3">
              {concessions.map((cnc) => (
                <div key={cnc.id} className={`${listItemClass} flex justify-between items-center text-left`}>
                  <div>
                    <div className="text-xs font-semibold text-white uppercase tracking-wide">{cnc.name}</div>
                    <div className={textMutedClass}>Popular: {cnc.popularItem}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold ${
                      cnc.status === 'crowded' ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                    }`}>
                      {cnc.waitTime} min line
                    </div>
                    <div className={textMutedClass}>{cnc.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

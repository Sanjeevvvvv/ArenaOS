'use client';

import React, { useState } from 'react';
import { useAppStore, type Alert } from '@/store/useAppStore';
import { MapPin, Info, AlertTriangle, Eye, Compass } from 'lucide-react';

interface StadiumMapProps {
  viewMode: 'heatmap' | 'accessibility' | 'standard';
  onSelectAlert?: (alert: Alert) => void;
}

export function StadiumMap({ viewMode, onSelectAlert }: StadiumMapProps) {
  const { alerts, accessibilityMode, sensoryMapMode } = useAppStore();
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Seating sections geometry definitions
  const sections = [
    { id: 'sec-a', name: 'Sector A (North Bowl)', path: 'M 150 50 Q 250 20 350 50 L 330 90 Q 250 70 170 90 Z', color: 'rgba(6, 182, 212, 0.1)', hoverColor: 'rgba(6, 182, 212, 0.25)', density: 0.35 },
    { id: 'sec-b', name: 'Sector B (North-East Bowl)', path: 'M 350 50 Q 450 100 450 200 L 400 190 Q 400 110 330 90 Z', color: 'rgba(6, 182, 212, 0.1)', hoverColor: 'rgba(6, 182, 212, 0.25)', density: 0.18 },
    { id: 'sec-c', name: 'Sector C (East Lower Bowl)', path: 'M 450 200 Q 480 300 450 400 L 400 390 Q 420 300 400 190 Z', color: 'rgba(6, 182, 212, 0.15)', hoverColor: 'rgba(6, 182, 212, 0.3)', density: 0.65 },
    { id: 'sec-d', name: 'Sector D (South Bowl)', path: 'M 450 400 Q 350 480 150 450 L 170 410 Q 250 430 330 410 Z', color: 'rgba(239, 68, 68, 0.2)', hoverColor: 'rgba(239, 68, 68, 0.35)', density: 0.88 }, // high crowd
    { id: 'sec-e', name: 'Sector E (West Lower Bowl)', path: 'M 150 450 Q 20 400 50 300 L 100 310 Q 80 360 170 410 Z', color: 'rgba(6, 182, 212, 0.12)', hoverColor: 'rgba(6, 182, 212, 0.28)', density: 0.42 },
    { id: 'sec-f', name: 'Sector F (North-West Bowl)', path: 'M 50 300 Q 20 200 150 50 L 170 90 Q 70 120 100 310 Z', color: 'rgba(16, 185, 129, 0.15)', hoverColor: 'rgba(16, 185, 129, 0.3)', density: 0.22 }
  ];

  // Specific interest nodes for accessibility
  const accNodes = [
    { id: 'acc-1', name: 'Elevator 4 (Step-Free)', x: 130, y: 110, type: 'elevator', status: 'operational' },
    { id: 'acc-2', name: 'Sensory Quiet Room (Sector B)', x: 380, y: 150, type: 'sensory', status: 'quiet' },
    { id: 'acc-3', name: 'Elevator 9 (South Entrance)', x: 320, y: 410, type: 'elevator', status: 'operational' },
    { id: 'acc-4', name: 'Medical Station A (Sector E)', x: 90, y: 350, type: 'medical', status: 'active' }
  ];

  const getHeatmapColor = (density: number) => {
    if (density > 0.8) return 'rgba(239, 68, 68, 0.65)'; // red
    if (density > 0.5) return 'rgba(234, 179, 8, 0.55)'; // yellow
    return 'rgba(16, 185, 129, 0.45)'; // green
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 border-red-300 text-white';
      case 'high': return 'bg-red-500 border-red-200 text-white';
      case 'medium': return 'bg-amber-500 border-amber-200 text-white';
      default: return 'bg-blue-500 border-blue-200 text-white';
    }
  };

  return (
    <div className="relative w-full h-[450px] bg-neutral-950/85 border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex justify-center items-center select-none">
      
      {/* Map Compass HUD */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/95 border border-white/10 text-xs font-semibold text-neutral-400">
        <Compass className="h-4 w-4 text-cyan-400 animate-spin-slow" />
        <span>FIFA SMART ARENA MATRIX</span>
      </div>

      {/* Map Mode Status Badge */}
      <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-neutral-900/95 border border-white/10 text-xs font-semibold">
        {viewMode === 'heatmap' && <span className="text-red-400 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>CROWD FLOW RADAR</span>}
        {viewMode === 'accessibility' && <span className="text-emerald-400 flex items-center gap-1">♿ ACCESSIBLE LAYER</span>}
        {viewMode === 'standard' && <span className="text-cyan-400">🏟️ STADIUM LAYOUT</span>}
      </div>

      {/* SVG Vector Map Canvas */}
      <svg 
        viewBox="0 0 500 500" 
        className="w-full h-full max-w-[450px] max-h-[450px] transition-transform duration-500"
      >
        {/* Outer Ring boundary */}
        <circle cx="250" cy="250" r="230" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        
        {/* Tactical Radar Range Rings */}
        <circle cx="250" cy="250" r="230" fill="none" stroke="rgba(6, 182, 212, 0.06)" strokeWidth="1" strokeDasharray="5 5" />
        <circle cx="250" cy="250" r="160" fill="none" stroke="rgba(6, 182, 212, 0.04)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="250" cy="250" r="90" fill="none" stroke="rgba(6, 182, 212, 0.03)" strokeWidth="1" strokeDasharray="3 3" />
        
        {/* Radar Sweeper Line */}
        <line x1="250" y1="250" x2="250" y2="20" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1.5" className="origin-center animate-[spin_6s_linear_infinite] pointer-events-none" />
        
        {/* Crosshair Grids */}
        <line x1="20" y1="250" x2="480" y2="250" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        <line x1="250" y1="20" x2="250" y2="480" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        
        {/* Seating Sections */}
        <g id="seating-bowl">
          {sections.map((sec) => {
            const isHovered = hoveredSection === sec.id;
            const densityColor = getHeatmapColor(sec.density);
            const fillStyle = viewMode === 'heatmap' 
              ? densityColor 
              : (isHovered ? sec.hoverColor : sec.color);
            
            return (
              <path
                key={sec.id}
                d={sec.path}
                fill={fillStyle}
                stroke={isHovered || viewMode === 'heatmap' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}
                strokeWidth={isHovered ? '2' : '1'}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSection(sec.id)}
                onMouseLeave={() => setHoveredSection(null)}
              />
            );
          })}
        </g>

        {/* Pitch (Football Field) */}
        <g id="pitch" transform="translate(175, 175)">
          {/* Field green overlay */}
          <rect x="0" y="0" width="150" height="150" fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" rx="4" />
          {/* Center Circle */}
          <circle cx="75" cy="75" r="25" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="2" />
          {/* Center line */}
          <line x1="0" y1="75" x2="150" y2="75" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="2" />
          {/* Penalty boxes */}
          <rect x="35" y="0" width="80" height="20" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1.5" />
          <rect x="35" y="130" width="80" height="20" fill="none" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1.5" />
        </g>

        {/* Outer Gates Markers */}
        <g id="gates" className="text-[10px] fill-muted-foreground font-semibold">
          <circle cx="250" cy="18" r="10" fill="#18181b" stroke="rgba(255,255,255,0.15)" />
          <text x="250" y="21" textAnchor="middle" fill="#fff" className="text-[8px] font-bold">G1</text>
          
          <circle cx="482" cy="250" r="10" fill="#18181b" stroke="rgba(255,255,255,0.15)" />
          <text x="482" y="253" textAnchor="middle" fill="#fff" className="text-[8px] font-bold">G3</text>
          
          <circle cx="250" cy="482" r="10" fill="#18181b" stroke="rgba(255,255,255,0.15)" />
          <text x="250" y="485" textAnchor="middle" fill="#fff" className="text-[8px] font-bold">G4</text>
          
          <circle cx="18" cy="250" r="10" fill="#18181b" stroke="rgba(255,255,255,0.15)" />
          <text x="18" y="253" textAnchor="middle" fill="#fff" className="text-[8px] font-bold">G6</text>
        </g>

        {/* Accessibility & Sensory Overlay */}
        {(viewMode === 'accessibility' || accessibilityMode || sensoryMapMode) && (
          <g id="accessibility-layer" className="animate-in fade-in">
            {accNodes.map((node) => {
              const isSensory = node.type === 'sensory';
              const color = isSensory ? 'rgb(16, 185, 129)' : 'rgb(59, 130, 246)';
              return (
                <g key={node.id} className="cursor-pointer group">
                  <circle 
                    cx={node.x} 
                    cy={node.y} 
                    r="8" 
                    fill={color} 
                    className="animate-pulse" 
                    opacity="0.9"
                  />
                  <circle 
                    cx={node.x} 
                    cy={node.y} 
                    r="14" 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="1" 
                    opacity="0.4"
                    className="animate-ping"
                  />
                  <text 
                    x={node.x} 
                    y={node.y - 12} 
                    textAnchor="middle" 
                    fill="#a1a1aa" 
                    className="text-[8px] font-bold pointer-events-none hidden group-hover:block bg-neutral-900 px-1 py-0.5 rounded border border-white/10"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Active Incident Alert Overlay */}
        <g id="alerts-layer">
          {alerts
            .filter((alt) => alt.status !== 'resolved')
            .map((alt) => {
              // Convert coordinate percents into SVG pixels (0-100% -> 0-500px)
              const px = (alt.coordinates.x / 100) * 500;
              const py = (alt.coordinates.y / 100) * 500;
              const isSelected = selectedAlert?.id === alt.id;

              return (
                <g 
                  key={alt.id} 
                  transform={`translate(${px}, ${py})`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedAlert(alt);
                    if (onSelectAlert) onSelectAlert(alt);
                  }}
                >
                  {/* Ping effect ring */}
                  <circle cx="0" cy="0" r={isSelected ? "18" : "12"} fill="none" stroke={alt.severity === 'critical' || alt.severity === 'high' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.7)'} strokeWidth="1.5" className="animate-ping" />
                  {/* Outer circle */}
                  <circle cx="0" cy="0" r={isSelected ? "9" : "6"} fill={alt.severity === 'critical' || alt.severity === 'high' ? '#ef4444' : '#eab308'} className="animate-pulse" />
                  {/* Inside point */}
                  <circle cx="0" cy="0" r="2" fill="#fff" />
                </g>
              );
            })}
        </g>
      </svg>

      {/* Map Tooltip / Detail overlay */}
      {hoveredSection && (
        <div className="absolute bottom-4 left-4 right-4 z-10 p-2.5 rounded-lg bg-neutral-900/95 border border-white/10 flex items-center justify-between text-xs transition duration-200">
          <div className="flex items-center gap-2 text-white font-medium">
            <Info className="h-4 w-4 text-cyan-400" />
            <span>{sections.find(s => s.id === hoveredSection)?.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground">Crowd Density:</span>
            <span className={`font-bold ${
              (sections.find(s => s.id === hoveredSection)?.density || 0) > 0.8 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {Math.floor((sections.find(s => s.id === hoveredSection)?.density || 0) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Alert Detail HUD Modal inside Map */}
      {selectedAlert && (
        <div className="absolute bottom-4 left-4 right-4 z-20 p-4 rounded-xl bg-neutral-900 border border-red-500/30 shadow-2xl flex flex-col gap-2 transition duration-300">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className={`flex h-2.5 w-2.5 rounded-full ${
                selectedAlert.severity === 'high' || selectedAlert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
              } animate-pulse`}></span>
              <h4 className="font-bold text-white text-sm">{selectedAlert.title}</h4>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAlert(null);
              }}
              className="text-xs text-muted-foreground hover:text-white transition px-2 py-0.5 border border-white/10 rounded hover:bg-white/5"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-neutral-300">{selectedAlert.description}</p>
          <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-white/5">
            <span>Location: {selectedAlert.location}</span>
            <span>Reported: {selectedAlert.timestamp}</span>
          </div>
        </div>
      )}

      {/* Layer selector bar */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-1 p-1 rounded-lg bg-neutral-900/90 border border-white/10 text-[10px] font-semibold text-neutral-400">
        <span className="px-2 py-1 rounded bg-neutral-950 text-cyan-400 border border-white/5">
          {viewMode === 'heatmap' ? 'Crowd Heatmap' : viewMode === 'accessibility' ? 'Access Path' : 'Overview'}
        </span>
      </div>
      
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, type UserRole } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  User, 
  Wrench, 
  LayoutDashboard, 
  AlertTriangle, 
  Bell, 
  Accessibility, 
  Radio,
  Volume2,
  VolumeX,
  ChevronDown,
  Check,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { soundManager } from '@/lib/sounds';
import { getTranslation, type Language } from '@/lib/translations';

export function Header() {
  const { 
    role, 
    setRole, 
    emergencyActive, 
    toggleEmergency,
    accessibilityMode,
    setAccessibilityMode,
    alerts,
    language,
    setLanguage,
    updateAlertStatus
  } = useAppStore();
  const router = useRouter();
  
  const [muted, setMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return soundManager.isMuted();
    }
    return false;
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.scrollY > 10;
    }
    return false;
  });
  
  // Custom dropdown states
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Refs for outside-click detection
  const roleRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    // Outside-click detection
    function handleClickOutside(event: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMuteToggle = () => {
    const newMuted = soundManager.toggleMute();
    setMuted(newMuted);
  };

  const handleRoleSelection = (newRole: UserRole) => {
    soundManager.playModeSound(newRole);
    setRole(newRole);
    setRoleDropdownOpen(false);

    if (newRole === 'fan') {
      router.push('/fan');
    } else if (newRole === 'staff') {
      router.push('/operations');
    } else if (newRole === 'security') {
      router.push('/command');
    } else if (newRole === 'organizer') {
      router.push('/organizer');
    }
  };

  const handleLanguageSelection = (newLang: Language) => {
    soundManager.playClick();
    setLanguage(newLang);
    setLangDropdownOpen(false);
  };

  const activeAlertsCount = alerts.filter(a => a.status !== 'resolved').length;

  const roleLabels: Record<UserRole, { label: string; desc: string; color: string; icon: React.ReactNode }> = {
    fan: {
      label: 'Fan Portal',
      desc: 'Wayfinding & SOS assistance',
      color: 'text-cyan-400',
      icon: <User className="h-4 w-4 text-cyan-400" />
    },
    staff: {
      label: 'Operations (Staff)',
      desc: 'Task routing & sustainability',
      color: 'text-emerald-400',
      icon: <Wrench className="h-4 w-4 text-emerald-400" />
    },
    security: {
      label: 'Security Command',
      desc: 'Radar map & CCTV monitor',
      color: 'text-rose-400',
      icon: <ShieldAlert className="h-4 w-4 text-rose-400" />
    },
    organizer: {
      label: 'Organizer (HQ)',
      desc: 'Executive KPIs & simulations',
      color: 'text-amber-400',
      icon: <LayoutDashboard className="h-4 w-4 text-amber-400" />
    }
  };

  const langLabels: Record<Language, { label: string; flag: string }> = {
    en: { label: 'English (US/CA)', flag: '🇺🇸' },
    es: { label: 'Español (MX)', flag: '🇲🇽' },
    fr: { label: 'Français (CA)', flag: '🇨🇦' }
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
      scrolled 
        ? 'bg-[#141218]/85 backdrop-blur-md border-border/30 shadow-md py-0' 
        : 'bg-transparent border-transparent py-1.5'
    }`}>
      <nav aria-label="Global Navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & FIFA Tag */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-cyan-400 bg-clip-text text-transparent">
              ArenaOS
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-[10px] font-semibold text-cyan-400">
            <Radio className="h-3 w-3 animate-pulse" />
            {getTranslation(language, 'aiCopilot')}
          </div>
        </div>

        {/* Dynamic Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Custom Language Dropdown Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => { soundManager.playClick(); setLangDropdownOpen(!langDropdownOpen); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold text-white transition cursor-pointer ${
                langDropdownOpen ? 'bg-white/10 border-border/30' : 'bg-neutral-900 border-border/20 hover:bg-neutral-900/60'
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-neutral-400" />
              <span className="uppercase">{language}</span>
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-panel border border-border/30 rounded-xl shadow-2xl p-2 z-50 text-left animate-in slide-in-from-top-2">
                {Object.entries(langLabels).map(([code, details]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageSelection(code as Language)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span>{details.flag}</span>
                      <span className={language === code ? 'text-white font-bold' : 'text-neutral-400'}>
                        {details.label}
                      </span>
                    </div>
                    {language === code && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mute/Unmute Audio */}
          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-lg border border-border/30 text-muted-foreground hover:text-white hover:bg-white/5 transition cursor-pointer"
            title={muted ? getTranslation(language, 'unmuteSound') : getTranslation(language, 'muteSound')}
            aria-label={muted ? getTranslation(language, 'unmuteSound') : getTranslation(language, 'muteSound')}
          >
            {muted ? <VolumeX className="h-4 w-4 text-red-400 animate-pulse" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
          </button>

          {/* Accessibility Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              setAccessibilityMode(!accessibilityMode);
            }}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              accessibilityMode 
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-400 animate-pulse' 
                : 'border-border/30 text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Accessibility Suite"
            aria-label="Toggle Accessibility Settings"
          >
            <Accessibility className="h-4 w-4" />
          </button>

          {/* Emergency SOS Alarm (Visible to Staff, Security, Organizers) */}
          {role !== 'fan' && (
            <button
              onClick={() => {
                soundManager.playClick();
                toggleEmergency();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
                emergencyActive 
                  ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse-slow neon-glow-red' 
                  : 'bg-neutral-900 border-border/40 text-neutral-400 hover:text-red-400 hover:border-red-950'
              }`}
              title={emergencyActive ? "Deactivate Evacuation" : "Activate Evacuation"}
            >
              <AlertTriangle className={`h-4 w-4 ${emergencyActive ? 'animate-bounce' : ''}`} />
              <span className="hidden md:inline">{emergencyActive ? 'ACTIVE EVACUATION' : 'TEST EVAC'}</span>
            </button>
          )}

          {/* Notification Indicators */}
          <div className="relative">
            <button 
              onClick={() => {
                soundManager.playClick();
                setNotificationsOpen(!notificationsOpen);
              }}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                notificationsOpen 
                  ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-400' 
                  : 'border-border/30 text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <Bell className="h-4 w-4" />
            </button>
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white leading-none">
                {activeAlertsCount}
              </span>
            )}

            {/* Notification Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 glass-panel border border-border/30 rounded-xl shadow-2xl p-4 z-50 text-left animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center pb-2 border-b border-border/30 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    {getTranslation(language, 'securityFeed')} ({activeAlertsCount})
                  </h4>
                  <button 
                    onClick={() => { soundManager.playClick(); setNotificationsOpen(false); }}
                    className="text-[10px] text-muted-foreground hover:text-white"
                  >
                    Close
                  </button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {alerts.filter(a => a.status !== 'resolved').length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground py-6">
                      {getTranslation(language, 'threatCleared')}
                    </div>
                  ) : (
                    alerts
                      .filter(a => a.status !== 'resolved')
                      .map((alt) => (
                        <div key={alt.id} className="p-2.5 rounded-lg bg-neutral-900 border border-border/30 space-y-1 text-xs text-left">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-bold text-white line-clamp-1">{alt.title}</span>
                            <span className="text-[9px] text-muted-foreground shrink-0">{alt.timestamp}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{alt.description}</p>
                          <div className="flex justify-between items-center pt-2 border-t border-border/30 text-[9px] mt-1.5">
                            <span className="text-neutral-400">Loc: {alt.location}</span>
                            <button
                              onClick={() => {
                                updateAlertStatus(alt.id, 'in-progress');
                              }}
                              className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition"
                            >
                              Ack
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom Role Dropdown Selector */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => { soundManager.playClick(); setRoleDropdownOpen(!roleDropdownOpen); }}
              className="flex items-center gap-2 bg-neutral-900 border border-border/30 rounded-lg px-3 py-2 text-xs font-semibold text-white transition cursor-pointer hover:border-border/60"
            >
              {roleLabels[role].icon}
              <span>{roleLabels[role].label}</span>
              <ChevronDown className="h-3 w-3 text-neutral-400 ml-1" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-panel border border-border/30 rounded-xl shadow-2xl p-2 z-50 text-left animate-in slide-in-from-top-2">
                {Object.entries(roleLabels).map(([roleKey, details]) => (
                  <button
                    key={roleKey}
                    onClick={() => handleRoleSelection(roleKey as UserRole)}
                    className="w-full flex gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition cursor-pointer"
                  >
                    <div className="mt-0.5 shrink-0">
                      {details.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold ${role === roleKey ? 'text-white font-bold' : 'text-neutral-300'}`}>
                        {details.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate leading-snug">
                        {details.desc}
                      </div>
                    </div>
                    {role === roleKey && (
                      <div className="self-center">
                        <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
        </div>

      </nav>
    </header>
  );
}

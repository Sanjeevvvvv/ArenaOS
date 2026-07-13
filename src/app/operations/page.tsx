'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, type Task } from '@/store/useAppStore';
import { soundManager } from '@/lib/sounds';
import { getTranslation } from '@/lib/translations';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { 
  Wrench, 
  CheckCircle, 
  Play, 
  Plus, 
  Clock, 
  Sparkles,
  TrendingUp,
  Droplet,
  Sun,
  Volume2,
  Trash2,
  Trash
} from 'lucide-react';

export default function OperationsDashboard() {
  const { 
    tasks, 
    addTask, 
    updateTaskStatus, 
    assignTask,
    concessions, 
    metrics,
    language
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCat, setNewTaskCat] = useState<'cleaning' | 'restocking' | 'assistance' | 'maintenance'>('cleaning');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskLocation, setNewTaskLocation] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Prevent SSR hydration mismatch on charts
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskLocation.trim()) return;

    addTask({
      title: newTaskTitle,
      description: newTaskDesc,
      location: newTaskLocation,
      category: newTaskCat,
      priority: newTaskPriority,
      status: 'pending'
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskLocation('');
    setShowTaskForm(false);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Chart data formatting
  const concessionChartData = concessions.map(c => ({
    name: c.name,
    WaitTime: c.waitTime,
  }));

  // Historical flow logs
  const timelineData = [
    { time: '17:00', Attendance: 32000, Flow: 150 },
    { time: '17:30', Attendance: 45000, Flow: 280 },
    { time: '18:00', Attendance: 59000, Flow: 410 },
    { time: '18:30', Attendance: metrics.totalAttendance, Flow: metrics.gateThroughput }
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 bg-neutral-950 text-white min-h-[calc(100vh-4rem)] space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/30 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Wrench className="text-emerald-400 h-5 w-5" />
            Stadium Logistics & Operations Cockpit
          </h1>
          <p className="text-xs text-muted-foreground">Manage volunteer task routing, monitor concession queues, and view carbon indicators.</p>
        </div>

        <button
          onClick={() => { soundManager.playClick(); setShowTaskForm(!showTaskForm); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs tracking-wider uppercase transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{showTaskForm ? 'Cancel dispatch' : 'New dispatch task'}</span>
        </button>
      </div>

      {/* Task dispatch form */}
      {showTaskForm && (
        <form 
          onSubmit={handleCreateTask}
          className="p-6 rounded-2xl glass-panel border border-emerald-500/25 max-w-xl mx-auto space-y-4 animate-in slide-in-from-top-4"
        >
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Operations Task Dispatcher
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Task Title *</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Spill Sector C"
                className="w-full bg-neutral-900 border border-border/40 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Location (Sector/Gate) *</label>
              <input
                type="text"
                required
                value={newTaskLocation}
                onChange={(e) => setNewTaskLocation(e.target.value)}
                placeholder="e.g. Concourse A near Gate 1"
                className="w-full bg-neutral-900 border border-border/40 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground">Detailed Instructions</label>
            <textarea
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              placeholder="Provide exact details for staff response..."
              className="w-full h-16 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Category</label>
              <select
                value={newTaskCat}
                onChange={(e) => setNewTaskCat(e.target.value as any)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 text-white cursor-pointer"
              >
                <option value="cleaning">Cleaning</option>
                <option value="restocking">Restocking</option>
                <option value="assistance">ADA Assistance</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 text-white cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded-xl text-xs tracking-wider uppercase hover:bg-emerald-400 transition"
            >
              Dispatch Task
            </button>
          </div>
        </form>
      )}

      {/* Telemetry charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts graphs (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Concessions (Bar Chart) */}
          <div className="rounded-2xl glass-panel p-5 space-y-4 border border-border/30">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-cyan-400" />
                Concession stand queues
              </h3>
              <p className="text-[10px] text-muted-foreground">Checkout wait times in minutes (Fluctuates in real-time).</p>
            </div>

            <div className="h-56 w-full text-xs">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={concessionChartData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={9} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <Bar dataKey="WaitTime" fill="url(#barGlow)" stroke="#06b6d4" strokeWidth={1} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">Loading analytics...</div>
              )}
            </div>
          </div>

          {/* Crowd Entry Rates (Line Chart) */}
          <div className="rounded-2xl glass-panel p-5 space-y-4 border border-border/30">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Ingress Flow Velocity
              </h3>
              <p className="text-[10px] text-muted-foreground">Processed spectators vs live gate processing speed.</p>
            </div>

            <div className="h-56 w-full text-xs">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 10, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="time" stroke="#71717a" fontSize={9} />
                    <YAxis stroke="#71717a" fontSize={9} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="Attendance" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 3 }} activeDot={{ r: 5 }} name="Attendance" />
                    <Line type="monotone" dataKey="Flow" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} name="Flow (p/m)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">Loading flow logs...</div>
              )}
            </div>
          </div>

        </div>

        {/* Sustainability indicators (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl glass-panel p-5 border border-border/30 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/30 pb-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Green Energy Telemetry
            </h3>
            <p className="text-[10px] text-muted-foreground">Resource recycling index & carbon offset indicators.</p>
          </div>

          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-border/30">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <Sun className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[9px] text-muted-foreground uppercase font-semibold">Solar Ingress</div>
                <div className="text-lg font-bold text-white leading-none mt-1">{metrics.energySolarPercent}%</div>
              </div>
              <span className="text-[9px] text-amber-400 font-bold uppercase">Grid Normal</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-border/30">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <Droplet className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[9px] text-muted-foreground uppercase font-semibold">Water Recycled</div>
                <div className="text-lg font-bold text-white leading-none mt-1">{metrics.waterRecycledLiters.toLocaleString()} L</div>
              </div>
              <span className="text-[9px] text-cyan-400 font-bold uppercase">Graywater active</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-border/30">
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                <Volume2 className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[9px] text-muted-foreground uppercase font-semibold">Decibel Level</div>
                <div className="text-lg font-bold text-white leading-none mt-1">{metrics.noiseLevelDb} dB</div>
              </div>
              <span className="text-[9px] text-rose-400 font-bold uppercase">Dynamic noise</span>
            </div>
          </div>

          <div className="text-[9px] text-neutral-400 leading-relaxed pt-2 border-t border-border/30 text-left">
            🌱 ArenaOS couples HVAC grid valves directly to stadium attendance fluctuations, automating water-saving cooling algorithms.
          </div>
        </div>

      </div>

      {/* Kanban Board */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 text-left">{getTranslation(language, 'logisticsBoard')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* PENDING COLUMN */}
          <div className="rounded-2xl bg-neutral-900/40 border border-border/30 p-4 flex flex-col gap-4 min-h-[350px]">
            <div className="flex justify-between items-center pb-2 border-b border-border/30 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Pending Dispatch ({pendingTasks.length})</span>
              <span className="h-2 w-2 rounded-full bg-neutral-600"></span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {pendingTasks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground py-10">
                  {getTranslation(language, 'allCleared')}
                </div>
              ) : (
                pendingTasks.map((tsk) => (
                  <div 
                    key={tsk.id} 
                    className={`p-4 rounded-xl bg-neutral-900 border border-border/30 space-y-3 text-left border-l-4 ${
                      tsk.priority === 'high' ? 'border-l-red-500' : tsk.priority === 'medium' ? 'border-l-amber-500' : 'border-l-zinc-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                        tsk.priority === 'high' ? 'bg-red-950/80 text-red-400 border-red-500/30' : 'bg-amber-950/80 text-amber-400 border-amber-500/30'
                      }`}>
                        {tsk.priority}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{tsk.timestamp}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs uppercase tracking-wide">{tsk.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{tsk.description}</p>
                    </div>
                    <div className="text-[10px] text-cyan-400">Location: {tsk.location}</div>
                    
                    <button
                      onClick={() => assignTask(tsk.id, 'Staff Co-pilot')}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-black animate-pulse" />
                      <span>Accept Task</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* IN-PROGRESS COLUMN */}
          <div className="rounded-2xl bg-neutral-900/40 border border-border/30 p-4 flex flex-col gap-4 min-h-[350px]">
            <div className="flex justify-between items-center pb-2 border-b border-border/30 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Active Shift Tasks ({inProgressTasks.length})</span>
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {inProgressTasks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground py-10">
                  No active shift tasks.
                </div>
              ) : (
                inProgressTasks.map((tsk) => (
                  <div 
                    key={tsk.id} 
                    className={`p-4 rounded-xl bg-neutral-900 border border-border/30 space-y-3 text-left border-l-4 ${
                      tsk.priority === 'high' ? 'border-l-red-500' : 'border-l-amber-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                        tsk.priority === 'high' ? 'bg-red-950/80 text-red-400 border-red-500/30' : 'bg-amber-950/80 text-amber-400 border-amber-500/30'
                      }`}>
                        {tsk.priority}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{tsk.timestamp}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs uppercase tracking-wide">{tsk.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{tsk.description}</p>
                    </div>
                    <div className="text-[10px] text-cyan-400">Location: {tsk.location}</div>
                    
                    <div className="text-[9px] p-2 bg-neutral-950 rounded text-neutral-300 border border-border/30">
                      Owner: <span className="font-semibold text-emerald-400">{tsk.assignedTo}</span>
                    </div>

                    <button
                      onClick={() => updateTaskStatus(tsk.id, 'completed')}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900 text-xs font-bold transition cursor-pointer"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Complete Task</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COMPLETED COLUMN */}
          <div className="rounded-2xl bg-neutral-900/40 border border-border/30 p-4 flex flex-col gap-4 min-h-[350px]">
            <div className="flex justify-between items-center pb-2 border-b border-border/30 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Completed Shift Tasks ({completedTasks.length})</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {completedTasks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-muted-foreground py-10">
                  No completed dispatches yet.
                </div>
              ) : (
                completedTasks.map((tsk) => (
                  <div key={tsk.id} className="p-4 rounded-xl bg-neutral-900/40 border border-border/30 opacity-60 space-y-2 text-left border-l-4 border-l-emerald-500">
                    <div className="flex justify-between">
                      <span className="text-[8px] uppercase font-bold text-muted-foreground">completed</span>
                      <span className="text-[9px] text-muted-foreground">{tsk.timestamp}</span>
                    </div>
                    <h4 className="font-bold text-neutral-300 text-xs line-through uppercase tracking-wide">{tsk.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tsk.description}</p>
                    <div className="text-[9px] text-muted-foreground">Location: {tsk.location}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

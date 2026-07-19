'use client';

import React, { useState } from 'react';
import { Shell } from '@/components/layout/Shell';

export default function SustainabilityPage() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'evac'>('metrics');

  const greenMetrics = [
    { name: 'Solar Energy Produced', value: '45,230 kWh', status: 'Optimal', change: '+12% vs last match' },
    { name: 'Water Saved (Rainwater Harvesting)', value: '185,000 Liters', status: 'Excellent', change: '+8% vs last match' },
    { name: 'Waste Diversion (Recycling/Compost)', value: '88.4%', status: 'Target Met', change: '+3.1% threshold gain' },
    { name: 'Offset Carbon Footprint', value: '142 Metric Tons', status: 'Growing', change: 'Planting 500 trees post-match' }
  ];

  const transitData = [
    { mode: '🚆 Public Metro/Train', share: '62%', passengers: '49,600 fans' },
    { mode: '🚌 Shuttle Bus Lines', share: '18%', passengers: '14,400 fans' },
    { mode: '🚲 Electric Bikes & Micro-Transit', share: '8%', passengers: '6,400 fans' },
    { mode: '🚗 Rideshare / Carpool', share: '12%', passengers: '9,600 fans' }
  ];

  const evacChecklist = [
    { step: '1', title: 'Verify Gate Clearances', desc: 'Ensure Gate A, B, and all emergency exit doors are completely unlocked and free of debris.' },
    { step: '2', title: 'Guide Accessible Fans First', desc: 'Identify wheelchair seats marked with ♿ and guide them toward the designated step-free transit elevators.' },
    { step: '3', title: 'Direct Public Flow', desc: 'Direct upper stands to Concourses using standard ramps. Prevent fans from bottlenecking at Gate entrances.' },
    { step: '4', title: 'Coordinate with HQ Dispatch', desc: 'Keep Volunteer Copilot open to log local hazards or crowd blocks to the central dispatch queue.' }
  ];

  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-4 py-8 flex-grow">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-brand-teal via-brand-cyan to-brand-lime bg-clip-text text-transparent mb-2">
            Sustainability & Emergency Preparedness
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time venue efficiency monitoring and on-ground volunteer evacuation guide for FIFA World Cup 2026.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-brand-border mb-6">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'metrics'
                ? 'border-brand-teal text-slate-900 dark:text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🍃 Green Operations Telemetry
          </button>
          <button
            onClick={() => setActiveTab('evac')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'evac'
                ? 'border-brand-teal text-slate-900 dark:text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            id="evac-guide-button"
          >
            🚨 Emergency Evac Guide (Volunteers)
          </button>
        </div>

        {activeTab === 'metrics' ? (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Grid 1: Green metrics */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-brand-elevated border border-brand-border p-6 rounded-xl shadow-md">
                <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg mb-4 flex items-center gap-2">
                  <span>🔋</span> Clean Energy & Resource Saving
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {greenMetrics.map((m, idx) => (
                    <div key={idx} className="bg-brand-dark/40 border border-brand-border/60 p-4 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-slate-500">{m.name}</span>
                      <div className="flex justify-between items-baseline mt-2">
                        <span className="text-xl font-black text-slate-800 dark:text-slate-100">{m.value}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20">
                          {m.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-brand-teal font-medium mt-1">{m.change}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transit Modal Share */}
              <div className="bg-brand-elevated border border-brand-border p-6 rounded-xl shadow-md">
                <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg mb-4 flex items-center gap-2">
                  <span>🚍</span> Low-Carbon Transit Share
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-brand-border text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-slate-500 font-bold">
                        <th className="py-2">Transit Mode</th>
                        <th className="py-2">Share %</th>
                        <th className="py-2">Estimated Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/50 text-slate-700 dark:text-slate-300">
                      {transitData.map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-200/20 dark:hover:bg-slate-800/20">
                          <td className="py-3 font-semibold">{t.mode}</td>
                          <td className="py-3 text-brand-teal font-bold">{t.share}</td>
                          <td className="py-3 text-xs">{t.passengers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Side Card: Eco Tips & Rules */}
            <div className="bg-brand-elevated border border-brand-border p-6 rounded-xl shadow-md h-fit">
              <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-base mb-4 flex items-center gap-1.5">
                <span>🌱</span> Stadium Rules
              </h2>
              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <div className="flex gap-2">
                  <span className="text-brand-cyan font-bold">1.</span>
                  <p><strong>Zero Single-Use Plastics:</strong> Food stalls serve in compostable containers. Fans can refill cups at water fountains.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-brand-cyan font-bold">2.</span>
                  <p><strong>Clean Energy:</strong> Venue operations (lighting, screens, command deck) run 100% on regional solar power grid offsets.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-brand-cyan font-bold">3.</span>
                  <p><strong>Waste Sorting:</strong> Dual-stream recycling stations are positioned every 10 meters on all concourses.</p>
                </div>
                <div className="border-t border-brand-border/40 pt-4">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Carbon Neutral Certificate</p>
                  <p className="mt-1 font-bold text-slate-800 dark:text-slate-200">ISO 20121 Venue Certified</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-brand-elevated border border-brand-border p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-status-red/10 text-status-red flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                  Volunteer Emergency Protocol Guide
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Critical actions to execute in the event of an official stadium evacuation order.
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {evacChecklist.map((c, idx) => (
                <div key={idx} className="bg-brand-dark/30 border border-brand-border/60 p-4 rounded-lg flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-cyan text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {c.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{c.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Alert Banner */}
            <div className="p-4 rounded-lg bg-status-red/10 border border-status-red/20 text-xs text-slate-800 dark:text-slate-300">
              <p className="font-bold uppercase tracking-wider text-status-red mb-1">🚨 Direct Evacuation Broadcast Route</p>
              When evacuation is active, the pathfinding engine will automatically disable Gate C and designate specific public transit plazas for safe dispersal. Volunteers must direct fans to the nearest open gate on their mobile maps.
            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}

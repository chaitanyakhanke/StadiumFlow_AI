'use client';

import React, { useState, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useStadium } from '@/context/StadiumContext';
import { AccessibleDataTable } from '@/components/ui/AccessibleDataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Incident } from '@/types';

export default function IncidentsLogPage() {
  const { incidents, zones, resolveIncident } = useStadium();
  
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Map zone names for easy display
  const zoneNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    zones.forEach(z => {
      map[z.id] = z.name;
    });
    return map;
  }, [zones]);

  // Compute stats
  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter(i => i.status !== 'RESOLVED').length;
    const critical = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
    return { total, open, critical };
  }, [incidents]);

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
      const matchStatus = statusFilter === 'ALL' || inc.status === statusFilter;
      const matchSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inc.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSeverity && matchStatus && matchSearch;
    });
  }, [incidents, severityFilter, statusFilter, searchTerm]);

  // Define columns for AccessibleDataTable
  const columns = [
    {
      header: 'Incident Alert',
      accessor: (item: Incident) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{item.title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm truncate" title={item.description}>
            {item.description}
          </div>
        </div>
      )
    },
    {
      header: 'Zone / Location',
      accessor: (item: Incident) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          📍 {zoneNameMap[item.zoneId] || item.zoneId}
        </span>
      )
    },
    {
      header: 'Severity',
      accessor: (item: Incident) => <StatusBadge status={item.severity} />
    },
    {
      header: 'Status',
      accessor: (item: Incident) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
          item.status === 'RESOLVED'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : item.status === 'INVESTIGATING'
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Reported By',
      accessor: (item: Incident) => (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <div>{item.reportedBy}</div>
          <div className="text-[10px] text-slate-500/80 mt-0.5">
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (item: Incident) => (
        item.status !== 'RESOLVED' ? (
          <Button
            variant="ghost"
            onClick={() => resolveIncident(item.id)}
            className="text-xs px-2.5 py-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 rounded"
          >
            Resolve
          </Button>
        ) : (
          <span className="text-xs text-slate-500 italic">No action required</span>
        )
      )
    }
  ];

  return (
    <Shell>
      <div className="max-w-7xl mx-auto px-4 py-8 flex-grow">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-status-red via-status-orange to-brand-cyan bg-clip-text text-transparent mb-2">
              Operations Incident Log
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Audit trail of all sensor alarms, medical alerts, crowd delays, and security escalations.
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-brand-elevated border border-brand-border p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Alerts</span>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 tabular-nums">
              {stats.total}
            </div>
          </div>
          <div className="bg-brand-elevated border border-brand-border p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500">Unresolved</span>
            <div className="text-2xl font-black text-status-orange mt-1 tabular-nums">
              {stats.open}
            </div>
          </div>
          <div className="bg-brand-elevated border border-brand-border p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-500">Critical Priority</span>
            <div className="text-2xl font-black text-status-red mt-1 tabular-nums">
              {stats.critical}
            </div>
          </div>
        </div>

        {/* Filters Controls */}
        <div className="bg-brand-elevated border border-brand-border p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-brand-dark text-slate-800 dark:text-slate-300 text-xs px-3 py-2 rounded border border-brand-border focus:border-brand-cyan focus:outline-none"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <label htmlFor="severity-select" className="text-[10px] uppercase font-bold text-slate-500 shrink-0">
                Severity:
              </label>
              <select
                id="severity-select"
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="bg-brand-dark text-slate-800 dark:text-slate-300 text-xs px-2.5 py-1.5 rounded border border-brand-border cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <label htmlFor="status-select" className="text-[10px] uppercase font-bold text-slate-500 shrink-0">
                Status:
              </label>
              <select
                id="status-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-brand-dark text-slate-800 dark:text-slate-300 text-xs px-2.5 py-1.5 rounded border border-brand-border cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-brand-elevated border border-brand-border p-6 rounded-xl shadow-md">
          <AccessibleDataTable
            caption="Operations Incident Alarm Log Table"
            data={filteredIncidents}
            columns={columns}
            keyExtractor={item => item.id}
            emptyMessage="No incidents match the selected search or filter criteria."
          />
        </div>

      </div>
    </Shell>
  );
}

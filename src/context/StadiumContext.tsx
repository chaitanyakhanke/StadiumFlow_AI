'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Zone, POI, Edge, Incident } from '@/types';
import { INITIAL_ZONES, INITIAL_POIS, INITIAL_EDGES, INITIAL_INCIDENTS } from '@/data/stadium-graph';

export type UserRole = 'fan' | 'operator' | 'volunteer';
export type Language = 'en' | 'hi' | 'hinglish' | 'es'; // English, Hindi (Devanagari), Hinglish (Latin), Spanish

interface StadiumContextType {
  zones: Zone[];
  pois: POI[];
  edges: Edge[];
  incidents: Incident[];
  selectedZoneId: string | null;
  selectedIncidentId: string | null;
  userRole: UserRole;
  language: Language;
  requireAccessible: boolean;
  avoidCongested: boolean;
  aiEnabled: boolean;
  theme: 'light' | 'dark';
  
  setSelectedZoneId: (id: string | null) => void;
  setSelectedIncidentId: (id: string | null) => void;
  setRole: (role: UserRole) => void;
  setLanguage: (lang: Language) => void;
  setRequireAccessible: (val: boolean) => void;
  setAvoidCongested: (val: boolean) => void;
  setAiEnabled: (val: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  resolveIncident: (id: string) => void;
  addIncident: (incident: Incident) => void;
  toggleAction: (incidentId: string, actionId: string) => void;
  updateZoneOccupancy: (zoneId: string, occupancy: number) => void;
  resetData: () => void;
}

const StadiumContext = createContext<StadiumContextType | undefined>(undefined);

export const StadiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<Zone[]>(() => JSON.parse(JSON.stringify(INITIAL_ZONES)));
  const [pois, setPois] = useState<POI[]>(() => JSON.parse(JSON.stringify(INITIAL_POIS)));
  const [edges, setEdges] = useState<Edge[]>(() => JSON.parse(JSON.stringify(INITIAL_EDGES)));
  const [incidents, setIncidents] = useState<Incident[]>(() => JSON.parse(JSON.stringify(INITIAL_INCIDENTS)));
  
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [userRole, setRoleState] = useState<UserRole>('fan');
  const [language, setLanguageState] = useState<Language>('en');
  
  const [requireAccessible, setRequireAccessible] = useState<boolean>(false);
  const [avoidCongested, setAvoidCongested] = useState<boolean>(false);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (val: 'light' | 'dark') => {
    setThemeState(val);
  };

  const resetData = () => {
    // Deep clone lists
    setZones(JSON.parse(JSON.stringify(INITIAL_ZONES)));
    setPois(JSON.parse(JSON.stringify(INITIAL_POIS)));
    setEdges(JSON.parse(JSON.stringify(INITIAL_EDGES)));
    setIncidents(JSON.parse(JSON.stringify(INITIAL_INCIDENTS)));
    setSelectedZoneId(null);
    setSelectedIncidentId(null);
  };

  const setRole = (role: UserRole) => {
    setRoleState(role);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const resolveIncident = (id: string) => {
    setIncidents(prev =>
      prev.map(inc =>
        inc.id === id ? { ...inc, status: 'RESOLVED' as const } : inc
      )
    );
    // If selected, close details or update
  };

  const addIncident = (incident: Incident) => {
    setIncidents(prev => [incident, ...prev]);
  };

  const toggleAction = (incidentId: string, actionId: string) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== incidentId) return inc;
        const updatedActions = inc.recommendedActions.map(action =>
          action.id === actionId ? { ...action, isCompleted: !action.isCompleted } : action
        );
        
        // Auto resolve if all actions are completed
        const allCompleted = updatedActions.every(a => a.isCompleted);
        const status = allCompleted ? ('RESOLVED' as const) : inc.status;
        
        return {
          ...inc,
          status,
          recommendedActions: updatedActions
        };
      })
    );
  };

  const updateZoneOccupancy = (zoneId: string, occupancy: number) => {
    setZones(prev =>
      prev.map(zone => {
        if (zone.id !== zoneId) return zone;
        // Keep a bounded trend history size of 5
        const trend = [...zone.trendHistory, occupancy].slice(-5);
        return {
          ...zone,
          currentOccupancy: Math.min(zone.capacity, Math.max(0, occupancy)),
          trendHistory: trend
        };
      })
    );
  };

  return (
    <StadiumContext.Provider
      value={{
        zones,
        pois,
        edges,
        incidents,
        selectedZoneId,
        selectedIncidentId,
        userRole,
        language,
        requireAccessible,
        avoidCongested,
        aiEnabled,
        theme,
        
        setSelectedZoneId,
        setSelectedIncidentId,
        setRole,
        setLanguage,
        setRequireAccessible,
        setAvoidCongested,
        setAiEnabled,
        setTheme,
        
        resolveIncident,
        addIncident,
        toggleAction,
        updateZoneOccupancy,
        resetData
      }}
    >
      {children}
    </StadiumContext.Provider>
  );
};

export const useStadium = () => {
  const context = useContext(StadiumContext);
  if (context === undefined) {
    throw new Error('useStadium must be used within a StadiumProvider');
  }
  return context;
};

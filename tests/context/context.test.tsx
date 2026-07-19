import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StadiumProvider, useStadium } from '@/context/StadiumContext';

// Helper test component to interact with context functions
const ContextConsumer: React.FC = () => {
  const {
    zones,
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
    resetData,
  } = useStadium();

  return (
    <div>
      <div data-testid="selected-zone">{selectedZoneId || 'none'}</div>
      <div data-testid="selected-incident">{selectedIncidentId || 'none'}</div>
      <div data-testid="role">{userRole}</div>
      <div data-testid="language">{language}</div>
      <div data-testid="accessible">{String(requireAccessible)}</div>
      <div data-testid="congested">{String(avoidCongested)}</div>
      <div data-testid="ai-enabled">{String(aiEnabled)}</div>
      <div data-testid="theme">{theme}</div>
      
      <div data-testid="incident-status-0">
        {incidents[0]?.id}: {incidents[0]?.status}
      </div>
      <div data-testid="incident-action-completed">
        {String(incidents[0]?.recommendedActions?.[0]?.isCompleted)}
      </div>
      <div data-testid="zone-occupancy-0">
        {zones[0]?.id}: {zones[0]?.currentOccupancy}
      </div>
      <div data-testid="zone-trend-0">
        {zones[0]?.trendHistory.join(',')}
      </div>

      <button onClick={() => setSelectedZoneId('ZONE_GATE_A')}>Select Zone</button>
      <button onClick={() => setSelectedIncidentId('INC_001')}>Select Incident</button>
      <button onClick={() => setRole('operator')}>Set Role</button>
      <button onClick={() => setLanguage('hi')}>Set Language</button>
      <button onClick={() => setRequireAccessible(true)}>Set Accessible</button>
      <button onClick={() => setAvoidCongested(true)}>Set Avoid Congested</button>
      <button onClick={() => setAiEnabled(false)}>Set AI Enabled</button>
      <button onClick={() => setTheme('dark')}>Set Theme</button>

      <button onClick={() => resolveIncident('INC_001')}>Resolve Incident</button>
      <button onClick={() => addIncident({
        id: 'INC_TEST',
        title: 'Test Incident',
        description: 'Testing',
        zoneId: 'ZONE_GATE_A',
        severity: 'LOW',
        status: 'OPEN',
        timestamp: new Date().toISOString(),
        reportedBy: 'Test Runner',
        evidence: 'N/A',
        recommendedActions: []
      })}>Add Incident</button>
      <button onClick={() => toggleAction('INC_001', 'ACT_C_1')}>Toggle Action</button>
      <button onClick={() => updateZoneOccupancy('ZONE_GATE_A', 1500)}>Update Occupancy</button>
      <button onClick={() => resetData()}>Reset</button>
    </div>
  );
};

describe('StadiumContext State Operations Tests', () => {
  it('should render provider and consumer with default values', () => {
    render(
      <StadiumProvider>
        <ContextConsumer />
      </StadiumProvider>
    );

    expect(screen.getByTestId('selected-zone').textContent).toBe('none');
    expect(screen.getByTestId('selected-incident').textContent).toBe('none');
    expect(screen.getByTestId('role').textContent).toBe('fan');
    expect(screen.getByTestId('language').textContent).toBe('en');
    expect(screen.getByTestId('accessible').textContent).toBe('false');
    expect(screen.getByTestId('congested').textContent).toBe('false');
    expect(screen.getByTestId('ai-enabled').textContent).toBe('true');
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should support updating state variables', () => {
    render(
      <StadiumProvider>
        <ContextConsumer />
      </StadiumProvider>
    );

    fireEvent.click(screen.getByText('Select Zone'));
    expect(screen.getByTestId('selected-zone').textContent).toBe('ZONE_GATE_A');

    fireEvent.click(screen.getByText('Select Incident'));
    expect(screen.getByTestId('selected-incident').textContent).toBe('INC_001');

    fireEvent.click(screen.getByText('Set Role'));
    expect(screen.getByTestId('role').textContent).toBe('operator');

    fireEvent.click(screen.getByText('Set Language'));
    expect(screen.getByTestId('language').textContent).toBe('hi');

    fireEvent.click(screen.getByText('Set Accessible'));
    expect(screen.getByTestId('accessible').textContent).toBe('true');

    fireEvent.click(screen.getByText('Set Avoid Congested'));
    expect(screen.getByTestId('congested').textContent).toBe('true');

    fireEvent.click(screen.getByText('Set AI Enabled'));
    expect(screen.getByTestId('ai-enabled').textContent).toBe('false');

    fireEvent.click(screen.getByText('Set Theme'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('should handle incidents modifications', () => {
    render(
      <StadiumProvider>
        <ContextConsumer />
      </StadiumProvider>
    );

    // Initial state check
    expect(screen.getByTestId('incident-status-0').textContent).toContain('OPEN');

    // Toggle Action
    fireEvent.click(screen.getByText('Toggle Action'));
    expect(screen.getByTestId('incident-action-completed').textContent).toBe('true');

    // Resolve incident
    fireEvent.click(screen.getByText('Resolve Incident'));
    expect(screen.getByTestId('incident-status-0').textContent).toContain('RESOLVED');

    // Add incident
    fireEvent.click(screen.getByText('Add Incident'));
    expect(screen.getByTestId('incident-status-0').textContent).toContain('INC_TEST');
  });

  it('should handle zone occupancy updates', () => {
    render(
      <StadiumProvider>
        <ContextConsumer />
      </StadiumProvider>
    );

    expect(screen.getByTestId('zone-occupancy-0').textContent).toContain('800');
    expect(screen.getByTestId('zone-trend-0').textContent).toBe('500,600,700,800');

    fireEvent.click(screen.getByText('Update Occupancy'));
    expect(screen.getByTestId('zone-occupancy-0').textContent).toContain('1500');
    expect(screen.getByTestId('zone-trend-0').textContent).toBe('500,600,700,800,1500');
  });

  it('should reset to initial data when resetData is clicked', () => {
    render(
      <StadiumProvider>
        <ContextConsumer />
      </StadiumProvider>
    );

    // Mutate state
    fireEvent.click(screen.getByText('Select Zone'));
    fireEvent.click(screen.getByText('Update Occupancy'));
    expect(screen.getByTestId('selected-zone').textContent).toBe('ZONE_GATE_A');
    expect(screen.getByTestId('zone-occupancy-0').textContent).toContain('1500');

    // Reset
    fireEvent.click(screen.getByText('Reset'));
    expect(screen.getByTestId('selected-zone').textContent).toBe('none');
    expect(screen.getByTestId('zone-occupancy-0').textContent).toContain('800');
  });
});

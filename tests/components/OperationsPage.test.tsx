import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OperationsPage from '@/app/operations/page';
import { StadiumProvider } from '@/context/StadiumContext';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/operations'
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('OperationsPage Component Tests', () => {
  it('should render the operations command dashboard with key cards and visualizer', () => {
    const { container } = render(
      <StadiumProvider>
        <OperationsPage />
      </StadiumProvider>
    );

    // Verify critical operational stats
    expect(screen.getByText('Total Stadium Crowd')).toBeInTheDocument();
    expect(screen.getByText('Active Inflow Rate')).toBeInTheDocument();
    expect(screen.getByText(/Incident Response Queue/i)).toBeInTheDocument();

    // Verify SVG layout is present
    const mapSvg = container.querySelector('svg');
    expect(mapSvg).toBeInTheDocument();
  });

  it('should allow selecting a zone and displaying operations details', () => {
    render(
      <StadiumProvider>
        <OperationsPage />
      </StadiumProvider>
    );

    // Click on inspect button in Accessible Data Table
    const inspectButtons = screen.getAllByRole('button', { name: /Inspect/i });
    expect(inspectButtons.length).toBeGreaterThan(0);
    
    // Inspect the first zone (Gate A)
    fireEvent.click(inspectButtons[0]);

    // Check that details panel renders and shows information
    expect(screen.getByText('Operations Briefing Detail')).toBeInTheDocument();
  });

  it('should display VIP zone and transit details on selection', () => {
    render(
      <StadiumProvider>
        <OperationsPage />
      </StadiumProvider>
    );

    // Find the inspect buttons
    const inspectButtons = screen.getAllByRole('button', { name: /Inspect/i });
    
    // The VIP lounge is zone index 6 in data
    fireEvent.click(inspectButtons[6]);
    expect(screen.getAllByText('VIP Club Lounge')[0]).toBeInTheDocument();

    // The Transit Plaza Hub is zone index 7
    fireEvent.click(inspectButtons[7]);
    expect(screen.getAllByText('Transit Plaza Hub')[0]).toBeInTheDocument();
  });

  it('should handle selecting and resolving active incidents', () => {
    render(
      <StadiumProvider>
        <OperationsPage />
      </StadiumProvider>
    );

    // Locate active incident in queue list
    const incidentAlert = screen.getByText('Gate B Inflow Bottleneck');
    fireEvent.click(incidentAlert);

    // Details pane should load incident actions checklist
    expect(screen.getByText('AI Operations Brief')).toBeInTheDocument();
    expect(screen.getByText('Open Alternate Gates')).toBeInTheDocument();

    // Resolve checklist step click
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    
    fireEvent.click(checkboxes[0]);
  });
});

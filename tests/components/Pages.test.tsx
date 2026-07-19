import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SustainabilityPage from '@/app/sustainability/page';
import IncidentsLogPage from '@/app/operations/incidents/page';
import { StadiumProvider } from '@/context/StadiumContext';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/sustainability'
}));

describe('SustainabilityPage Component', () => {
  it('should render sustainability metrics tab by default', () => {
    render(
      <StadiumProvider>
        <SustainabilityPage />
      </StadiumProvider>
    );

    expect(screen.getByText('Sustainability & Emergency Preparedness')).toBeInTheDocument();
    expect(screen.getByText('Solar Energy Produced')).toBeInTheDocument();
    expect(screen.getByText('Water Saved (Rainwater Harvesting)')).toBeInTheDocument();
    expect(screen.getByText('🚆 Public Metro/Train')).toBeInTheDocument();
  });

  it('should switch to emergency evac guide tab when clicked', () => {
    render(
      <StadiumProvider>
        <SustainabilityPage />
      </StadiumProvider>
    );

    const evacTabButton = screen.getByRole('button', { name: /Emergency Evac Guide/i });
    fireEvent.click(evacTabButton);

    expect(screen.getByText('Volunteer Emergency Protocol Guide')).toBeInTheDocument();
    expect(screen.getByText('Verify Gate Clearances')).toBeInTheDocument();
    expect(screen.getByText('Guide Accessible Fans First')).toBeInTheDocument();
    expect(screen.queryByText('Solar Energy Produced')).not.toBeInTheDocument();
  });
});

describe('IncidentsLogPage Component', () => {
  it('should render incidents table and statistics', () => {
    render(
      <StadiumProvider>
        <IncidentsLogPage />
      </StadiumProvider>
    );

    expect(screen.getByText('Operations Incident Log')).toBeInTheDocument();
    expect(screen.getByText('Total Alerts')).toBeInTheDocument();
    expect(screen.getByText('Unresolved')).toBeInTheDocument();
    expect(screen.getByText('Incident Alert')).toBeInTheDocument();
    expect(screen.getByText('Zone / Location')).toBeInTheDocument();
  });

  it('should allow filtering by search term', () => {
    render(
      <StadiumProvider>
        <IncidentsLogPage />
      </StadiumProvider>
    );

    const searchInput = screen.getByPlaceholderText('Search logs...');
    
    // Type something that doesn't match
    fireEvent.change(searchInput, { target: { value: 'NonexistentIncidentSearchQuery' } });
    expect(screen.getByText('No incidents match the selected search or filter criteria.')).toBeInTheDocument();
  });
});

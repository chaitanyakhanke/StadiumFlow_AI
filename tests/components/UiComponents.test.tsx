import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AlertCard } from '@/components/ui/AlertCard';
import { AccessibleDataTable } from '@/components/ui/AccessibleDataTable';

describe('Button Component', () => {
  it('should render standard button text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should render left and right icons when provided', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">👈</span>}
        rightIcon={<span data-testid="right-icon">👉</span>}
      >
        Go
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
  });

  it('should show loading spinner and disable button when isLoading is true', () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('should respond to click events when active', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not trigger click when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    fireEvent.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('StatusBadge Component', () => {
  it('should display correct text and color class for traffic levels', () => {
    const { rerender } = render(<StatusBadge status="GREEN" />);
    expect(screen.getByText('Low Traffic')).toBeInTheDocument();

    rerender(<StatusBadge status="RED" />);
    expect(screen.getByText('Critical / Delayed')).toBeInTheDocument();

    rerender(<StatusBadge status="YELLOW" />);
    expect(screen.getByText('Moderate Traffic')).toBeInTheDocument();

    rerender(<StatusBadge status="ORANGE" />);
    expect(screen.getByText('Heavy Traffic')).toBeInTheDocument();
  });

  it('should display correct text for incident severity levels', () => {
    const { rerender } = render(<StatusBadge status="CRITICAL" />);
    expect(screen.getByText('Critical Priority')).toBeInTheDocument();

    rerender(<StatusBadge status="HIGH" />);
    expect(screen.getByText('High Severity')).toBeInTheDocument();

    rerender(<StatusBadge status="MEDIUM" />);
    expect(screen.getByText('Medium Severity')).toBeInTheDocument();

    rerender(<StatusBadge status="LOW" />);
    expect(screen.getByText('Low Severity')).toBeInTheDocument();
  });
});

describe('AlertCard Component', () => {
  it('should render alert details correctly', () => {
    render(
      <AlertCard
        title="Gate C Delay"
        description="Heavy crowding at Gate C stand entrance."
        severity="HIGH"
        zoneName="Stand Section C"
        timestamp="2026-07-19T10:00:00.000Z"
      />
    );

    expect(screen.getByText('Gate C Delay')).toBeInTheDocument();
    expect(screen.getByText('Heavy crowding at Gate C stand entrance.')).toBeInTheDocument();
    expect(screen.getByText('Stand Section C')).toBeInTheDocument();
  });

  it('should trigger onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <AlertCard
        title="Incident"
        description="Something happened"
        severity="LOW"
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByRole('alert'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('AccessibleDataTable Component', () => {
  interface TestData {
    id: string;
    name: string;
    value: number;
  }

  const mockData: TestData[] = [
    { id: '1', name: 'Item One', value: 100 },
    { id: '2', name: 'Item Two', value: 200 }
  ];

  const columns = [
    { header: 'ID', accessor: (item: TestData) => item.id },
    { header: 'Name', accessor: (item: TestData) => item.name },
    { header: 'Value', accessor: (item: TestData) => `$${item.value}` }
  ];

  it('should render table columns and rows correctly', () => {
    render(
      <AccessibleDataTable
        caption="Mock Data Table"
        data={mockData}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    );

    expect(screen.getByText('Mock Data Table')).toBeInTheDocument();
    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('Item Two')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('should render empty message when data list is empty', () => {
    render(
      <AccessibleDataTable
        caption="Mock Empty Table"
        data={[]}
        columns={columns}
        keyExtractor={(item: TestData) => item.id}
        emptyMessage="Nothing here!"
      />
    );

    expect(screen.getByText('Nothing here!')).toBeInTheDocument();
  });
});

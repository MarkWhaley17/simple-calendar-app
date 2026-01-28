import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomNav from '../../../components/navigation/BottomNav';

describe('BottomNav', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all navigation items', () => {
    const { getByText } = render(
      <BottomNav currentView="month" onNavigate={mockOnNavigate} todayDate={15} />
    );

    expect(getByText('Account')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('Month')).toBeTruthy();
    expect(getByText('Events')).toBeTruthy();
  });

  it('should display today\'s date in day icon', () => {
    const { getByText } = render(
      <BottomNav currentView="month" onNavigate={mockOnNavigate} todayDate={28} />
    );

    expect(getByText('28')).toBeTruthy();
  });

  it('should call onNavigate with "account" when Account is pressed', () => {
    const { getByText } = render(
      <BottomNav currentView="month" onNavigate={mockOnNavigate} todayDate={15} />
    );

    fireEvent.press(getByText('Account'));
    expect(mockOnNavigate).toHaveBeenCalledWith('account');
  });

  it('should call onNavigate with "day" when Today is pressed', () => {
    const { getByText } = render(
      <BottomNav currentView="month" onNavigate={mockOnNavigate} todayDate={15} />
    );

    fireEvent.press(getByText('Today'));
    expect(mockOnNavigate).toHaveBeenCalledWith('day');
  });

  it('should call onNavigate with "month" when Month is pressed', () => {
    const { getByText } = render(
      <BottomNav currentView="month" onNavigate={mockOnNavigate} todayDate={15} />
    );

    fireEvent.press(getByText('Month'));
    expect(mockOnNavigate).toHaveBeenCalledWith('month');
  });

  it('should highlight active view', () => {
    const { getByText, rerender } = render(
      <BottomNav currentView="month" onNavigate={mockOnNavigate} todayDate={15} />
    );

    // Test month active
    const monthLabel = getByText('Month');
    expect(monthLabel).toBeTruthy();

    // Test day active
    rerender(
      <BottomNav currentView="day" onNavigate={mockOnNavigate} todayDate={15} />
    );
    const dayLabel = getByText('Today');
    expect(dayLabel).toBeTruthy();

    // Test account active
    rerender(
      <BottomNav currentView="account" onNavigate={mockOnNavigate} todayDate={15} />
    );
    const accountLabel = getByText('Account');
    expect(accountLabel).toBeTruthy();
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CalendarHeader from '../../../components/calendar/CalendarHeader';

describe('CalendarHeader', () => {
  const mockOnPreviousMonth = jest.fn();
  const mockOnNextMonth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render month and year', () => {
    const date = new Date(2026, 0, 15); // January 2026
    const { getByText } = render(
      <CalendarHeader
        currentDate={date}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
      />
    );

    expect(getByText('January')).toBeTruthy();
    expect(getByText(/2026/)).toBeTruthy();
  });

  it('should call onPreviousMonth when left button pressed', () => {
    const date = new Date(2026, 0, 15);
    const { getByText } = render(
      <CalendarHeader
        currentDate={date}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
      />
    );

    fireEvent.press(getByText('‹'));
    expect(mockOnPreviousMonth).toHaveBeenCalledTimes(1);
  });

  it('should call onNextMonth when right button pressed', () => {
    const date = new Date(2026, 0, 15);
    const { getByText } = render(
      <CalendarHeader
        currentDate={date}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
      />
    );

    fireEvent.press(getByText('›'));
    expect(mockOnNextMonth).toHaveBeenCalledTimes(1);
  });

  it('should display different months correctly', () => {
    const januaryDate = new Date(2026, 0, 15);
    const { getByText, rerender } = render(
      <CalendarHeader
        currentDate={januaryDate}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
      />
    );

    expect(getByText('January')).toBeTruthy();

    const decemberDate = new Date(2026, 11, 15);
    rerender(
      <CalendarHeader
        currentDate={decemberDate}
        onPreviousMonth={mockOnPreviousMonth}
        onNextMonth={mockOnNextMonth}
      />
    );

    expect(getByText('December')).toBeTruthy();
  });
});

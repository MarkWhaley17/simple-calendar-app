import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import CalendarHeader from './src/components/CalendarHeader';
import CalendarGrid from './src/components/CalendarGrid';
import DayView from './src/screens/DayView';

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  const handleBackToMonth = () => {
    setViewMode('month');
    setSelectedDate(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {viewMode === 'day' && selectedDate ? (
        <DayView selectedDate={selectedDate} onBack={handleBackToMonth} />
      ) : (
        <ScrollView style={styles.content}>
          <CalendarHeader
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
          <CalendarGrid currentDate={currentDate} onDayPress={handleDayPress} />
          <StatusBar style="auto" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});

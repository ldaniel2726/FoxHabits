import { addDays, addMonths, addWeeks, addYears, differenceInDays, differenceInWeeks, 
  differenceInMonths, differenceInYears, startOfDay, endOfDay, isSameDay } from 'date-fns';

interface Habit {
  habit_id: number;
  habit_type: 'normal_habit' | 'bad_habit';
  habit_interval_type: 'days' | 'weeks' | 'months' | 'years';
  interval: number;
  start_date: string;
  is_active: boolean;
  entries: Array<{
    entry_id: number;
    datetime: string;
    entry_type: 'done' | 'skipped';
  }>;
}

export function isHabitCompletedOnDate(habit: Habit, date: Date = new Date()): { 
  isCompleted: boolean;
  isSkipped: boolean;
  requiredCompletions: number;
  actualCompletions: number;
  periodStart: Date;
  periodEnd: Date;
} {
  const checkDate = startOfDay(date);
  const endDate = endOfDay(date);
  
  const habitStartDate = startOfDay(new Date(habit.start_date));
  
  if (checkDate < habitStartDate) {
    return {
      isCompleted: false,
      isSkipped: false,
      requiredCompletions: 0,
      actualCompletions: 0,
      periodStart: habitStartDate,
      periodEnd: habitStartDate
    };
  }
  
  let periodStart: Date;
  let periodEnd: Date;
  
  switch (habit.habit_interval_type) {
    case 'days':
      periodStart = checkDate;
      periodEnd = endOfDay(checkDate);
      break;
      
    case 'weeks':
      const daysSinceStart = differenceInDays(checkDate, habitStartDate);
      const weeksSinceStart = Math.floor(daysSinceStart / 7);
      const periodNumber = Math.floor(weeksSinceStart / habit.interval);
      periodStart = addWeeks(habitStartDate, periodNumber * habit.interval);
      periodEnd = endOfDay(addDays(periodStart, 7 * habit.interval - 1));
      break;
      
    case 'months':
      const monthPeriodNumber = Math.floor(differenceInMonths(checkDate, habitStartDate) / habit.interval);
      periodStart = addMonths(habitStartDate, monthPeriodNumber * habit.interval);
      periodEnd = endOfDay(addDays(addMonths(periodStart, habit.interval), -1));
      break;
      
    case 'years':
      const yearPeriodNumber = Math.floor(differenceInYears(checkDate, habitStartDate) / habit.interval);
      periodStart = addYears(habitStartDate, yearPeriodNumber * habit.interval);
      periodEnd = endOfDay(addDays(addYears(periodStart, habit.interval), -1));
      break;
      
    default:
      throw new Error(`Unknown habit interval type: ${habit.habit_interval_type}`);
  }

  const requiredCompletions = habit.interval;
  
  const entriesInPeriod = (habit.entries || []).filter(entry => {
    const entryDate = new Date(entry.datetime.replace(' ', 'T') + 'Z');
    return entryDate >= periodStart && entryDate <= periodEnd && entry.entry_type === 'done';
  });

  const skippedEntriesInPeriod = (habit.entries || []).filter(entry => {
    const entryDate = new Date(entry.datetime.replace(' ', 'T') + 'Z');
    return entryDate >= periodStart && entryDate <= periodEnd && entry.entry_type === 'skipped';
  });
  
  const actualCompletions = entriesInPeriod.length;
  const isSkipped = skippedEntriesInPeriod.length > 0;

  const isCompleted = !isSkipped && (habit.habit_type === 'normal_habit' 
    ? actualCompletions > 0
    : actualCompletions === 0);

  return {
    isCompleted,
    isSkipped,
    requiredCompletions,
    actualCompletions,
    periodStart,
    periodEnd
  };
}

export function isHabitCompletedExactDay(habit: Habit, date: Date = new Date()): {
  isCompleted: boolean;
  isSkipped: boolean;
} {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  const completedOnDay = habit.entries.some(entry => {
    const entryDate = new Date(entry.datetime);
    return entryDate >= dayStart && entryDate <= dayEnd && entry.entry_type === 'done';
  });

  const skippedOnDay = habit.entries.some(entry => {
    const entryDate = new Date(entry.datetime);
    return entryDate >= dayStart && entryDate <= dayEnd && entry.entry_type === 'skipped';
  });
  
  if (skippedOnDay) {
    return {
      isCompleted: false,
      isSkipped: true
    };
  }
  
  const isCompleted = habit.habit_type === 'normal_habit' ? completedOnDay : !completedOnDay;
  
  return {
    isCompleted,
    isSkipped: false
  };
}


export function calculateHabitStreak(habit: Habit, currentDate: Date = new Date()): number {
  if (!habit.entries.length && habit.habit_type === 'normal_habit') return 0;

  const sortedEntries = habit.entries
    .filter(entry => entry.entry_type === 'done')
    .map(entry => new Date(entry.datetime.replace(' ', 'T') + 'Z'))
    .sort((a, b) => b.getTime() - a.getTime());

    const today = currentDate;

  if (sortedEntries.length === 0) {
    if (habit.habit_type === 'normal_habit') return 0;
    if (habit.habit_type === 'bad_habit') {
      
      return differenceInDays(today, new Date(habit.start_date));
    }
  }

  const mostRecentEntry = startOfDay(sortedEntries[0]);

  if (habit.habit_type === 'bad_habit') {
   
    return differenceInDays(today, mostRecentEntry);
    
  }
  
  if (habit.habit_interval_type === 'days' && habit.interval === 1) {
    const daysSinceLastEntry = differenceInDays(today, mostRecentEntry);
    if (daysSinceLastEntry > 1) {
      return 0; 
    }
  } else {
    const currentPeriodInfo = isHabitCompletedOnDate(habit, today);
    if (mostRecentEntry < currentPeriodInfo.periodStart) {
      return 0;
    }
  }
  
  let streak = 0;
  
  let dateToCheck = today;
  const currentPeriodInfo = isHabitCompletedOnDate(habit, today);
  
  const completionsToday = sortedEntries.filter(
    date => startOfDay(date).getTime() === today.getTime()
  );
  
  const isTodayCompleted = completionsToday.length > 0;
  const isTodaySkipped = habit.entries.some(entry => {
    const entryDate = startOfDay(new Date(entry.datetime));
    return entryDate.getTime() === today.getTime() && entry.entry_type === 'skipped';
  });
  
  if (!isTodayCompleted && !isTodaySkipped && today.getTime() !== mostRecentEntry.getTime()) {
    const streakStartDate = mostRecentEntry;
    dateToCheck = streakStartDate;
  }
  
  while (true) {
    const periodInfo = isHabitCompletedOnDate(habit, dateToCheck);
    const periodStart = periodInfo.periodStart;
    const periodEnd = addInterval(periodStart, habit.habit_interval_type, habit.interval);
    
    const completionsInPeriod = sortedEntries.filter(
      date => date >= periodStart && date < periodEnd
    );

    const skippedInPeriod = habit.entries.some(entry => {
      const entryDate = new Date(entry.datetime);
      return entryDate >= periodStart && 
             entryDate < periodEnd && 
             entry.entry_type === 'skipped';
    });
    
    if (skippedInPeriod || 
        (habit.habit_type === 'normal_habit' && completionsInPeriod.length === 0)) {
      break;
    }

    if (!isTodaySkipped) {
      streak++;
    }
    
    dateToCheck = addInterval(periodStart, habit.habit_interval_type, -habit.interval);
    
    if (dateToCheck < new Date(habit.start_date)) {
      break;
    }
  }

  return streak;
}

function addInterval(date: Date, intervalType: string, intervalValue: number): Date {
  switch (intervalType) {
    case 'days':
      return addDays(date, intervalValue);
    case 'weeks':
      return addWeeks(date, intervalValue);
    case 'months':
      return addMonths(date, intervalValue);
    case 'years':
      return addYears(date, intervalValue);
    default:
      throw new Error(`Unknown habit interval type: ${intervalType}`);
  }
}



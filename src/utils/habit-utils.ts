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
      console.log('periodStart', periodStart);
      console.log('periodEnd', periodEnd);
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
  console.log(habit.entries);
  const requiredCompletions = habit.interval;
  
  const entriesInPeriod = habit.entries.filter(entry => {
    const entryDate = new Date(entry.datetime.replace(' ', 'T') + 'Z');
    return entryDate >= periodStart && entryDate <= periodEnd && entry.entry_type === 'done';
  });
  console.log('entriesInPeriod', entriesInPeriod);

  const skippedEntriesInPeriod = habit.entries.filter(entry => {
    const entryDate = new Date(entry.datetime.replace(' ', 'T') + 'Z');
    return entryDate >= periodStart && entryDate <= periodEnd && entry.entry_type === 'skipped';
  });
  
  const actualCompletions = entriesInPeriod.length;
  const isSkipped = skippedEntriesInPeriod.length > 0;
  console.log('actualCompletions', actualCompletions);
  
  const isCompleted = !isSkipped && (habit.habit_type === 'normal_habit' 
    ? actualCompletions > 0
    : actualCompletions === 0);
  
    console.log('isCompleted', isCompleted);

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

export function isHabitCompletedForPeriod(
  habit: Habit, 
  periodStart: Date, 
  periodEnd: Date
): {
  completedDays: [number, number, number]; // [completed, skipped, total]
} {
  const startDate = startOfDay(periodStart);
  const endDate = endOfDay(periodEnd);
  
  const habitStartDate = startOfDay(new Date(habit.start_date));
  
  if (habitStartDate > endDate) {
    return {
      completedDays: [0, 0, 0]
    };
  }
  
  const effectiveStartDate = habitStartDate > startDate ? habitStartDate : startDate;
  
  const totalDaysInPeriod = differenceInDays(endDate, effectiveStartDate) + 1;
  
  const completedEntries = habit.entries.filter(entry => {
    const entryDate = new Date(entry.datetime);
    return entryDate >= effectiveStartDate && 
           entryDate <= endDate && 
           entry.entry_type === 'done';
  });
  
  const skippedEntries = habit.entries.filter(entry => {
    const entryDate = new Date(entry.datetime);
    return entryDate >= effectiveStartDate && 
           entryDate <= endDate && 
           entry.entry_type === 'skipped';
  });
  
  const completedCount = completedEntries.length;
  const skippedCount = skippedEntries.length;
  
  return {
    completedDays: [completedCount, skippedCount, totalDaysInPeriod]
  };
}

export function calculateHabitStreak(habit: Habit, currentDate: Date = new Date()): number {
  if (!habit.entries.length) return 0;

  const sortedEntries = habit.entries
    .filter(entry => entry.entry_type === 'done')
    .map(entry => new Date(entry.datetime))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedEntries.length === 0) return 0;

  const today = startOfDay(currentDate);
  const mostRecentEntry = sortedEntries[0];

  const currentPeriodInfo = isHabitCompletedOnDate(habit, today);

  if (mostRecentEntry < currentPeriodInfo.periodStart) {
    return 0;
  }

  let streak = 1; // Start with current period
  let previousPeriodEnd = currentPeriodInfo.periodStart;

  while (true) {
    let previousPeriodStart: Date;

    switch (habit.habit_interval_type) {
      case 'days':
        previousPeriodStart = addDays(previousPeriodEnd, -habit.interval);
        break;
      case 'weeks':
        previousPeriodStart = addWeeks(previousPeriodEnd, -habit.interval);
        break;
      case 'months':
        previousPeriodStart = addMonths(previousPeriodEnd, -habit.interval);
        break;
      case 'years':
        previousPeriodStart = addYears(previousPeriodEnd, -habit.interval);
        break;
      default:
        throw new Error(`Unknown habit interval type: ${habit.habit_interval_type}`);
    }

    if (previousPeriodStart < new Date(habit.start_date)) {
      break;
    }

    const completionsInPeriod = sortedEntries.filter(
      date => date >= previousPeriodStart && date < previousPeriodEnd
    );

    const skippedInPeriod = habit.entries.some(entry => {
      const entryDate = new Date(entry.datetime);
      return entryDate >= previousPeriodStart && 
             entryDate < previousPeriodEnd && 
             entry.entry_type === 'skipped';
    });

    if (skippedInPeriod || 
        (habit.habit_type === 'normal_habit' && completionsInPeriod.length === 0) ||
        (habit.habit_type === 'bad_habit' && completionsInPeriod.length > 0)) {
      break;
    }

    streak++;
    previousPeriodEnd = previousPeriodStart;
  }

  return streak;
} 
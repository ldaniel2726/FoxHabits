import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Button } from '@/components/ui/button'; 
import { Card } from '@/components/ui/card';
import { isHabitCompletedOnDate } from '@/utils/habit-utils';

let dailyHabitWithoutEntries = {
  habit_id: 30,
  habit_interval_type: 'days' as const,
  interval: 1,
  start_date: '2025-04-07T09:27:00+00:00',
  is_active: true,
  habit_type: 'normal_habit' as const,
  habit_names: { habit_name: 'Fogmosás' },
  entries: []
}

let dailyBadHabitWithEntry = {
  habit_id: 11,
  habit_interval_type: 'days' as const,
  interval: 1,
  start_date: '2025-02-06T17:15:00+00:00',
  is_active: true,
  habit_type: 'bad_habit' as const,
  habit_names: { habit_name: 'Cigaretta lerakása' },
  entries: [
    {
      datetime: '2025-03-02T20:56:04.559',
      entry_id: 12,
      habit_id: 11,
      entry_type: 'done' as const,
      time_of_entry: '2025-03-02T20:56:04.338+00:00'
    }
  ]
}

let dailyNormalHabitWithEntry = {
  habit_id: 11,
  habit_interval_type: 'days' as const,
  interval: 1,
  start_date: '2025-02-06T17:15:00+00:00',
  is_active: true,
  habit_type: 'normal_habit' as const,
  habit_names: { habit_name: 'Cigaretta lerakása' },
  entries: [
    {
      datetime: '2025-03-02T20:56:04.559',
      entry_id: 12,
      habit_id: 11,
      entry_type: 'done' as const,
      time_of_entry: '2025-03-02T20:56:04.338+00:00'
    },
    {
      datetime: '2025-03-04T18:20:04.559',
      entry_id: 12,
      habit_id: 11,
      entry_type: 'skipped' as const,
      time_of_entry: '2025-03-02T20:56:04.338+00:00'
    }
  ]
}

let weeklyNormalHabitWithEntry = {
  habit_id: 12,
  habit_interval_type: 'weeks' as const,
  interval: 1,
  start_date: '2025-02-03T17:15:00+00:00',
  is_active: true,
  habit_type: 'normal_habit' as const,
  habit_names: { habit_name: 'Heti edzés' },
  entries: [
    {
      datetime: '2025-02-05T20:56:04.559',
      entry_id: 13,
      habit_id: 12,
      entry_type: 'done' as const,
      time_of_entry: '2025-03-02T20:56:04.338+00:00'
    },
    {
      datetime: '2025-02-14T18:20:04.559',
      entry_id: 14,
      habit_id: 12,
      entry_type: 'skipped' as const,
      time_of_entry: '2025-03-04T18:20:04.338+00:00'
    }
  ]
}



test('Test daily habit without entries', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    dailyHabitWithoutEntries, new Date('2025-04-07T09:27:00+00:00'))
  expect(isCompletedResult.isCompleted).toBe(false);
  expect(isCompletedResult.isSkipped).toBe(false);
});


test('Test daily habit without entries 2', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    dailyHabitWithoutEntries, new Date())
  expect(isCompletedResult.isCompleted).toBe(false);
  expect(isCompletedResult.isSkipped).toBe(false);
});

test('Test daily habit with entry with the appropriate date done', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    dailyNormalHabitWithEntry, new Date('2025-03-02T09:27:00+00:00'))
  expect(isCompletedResult.isCompleted).toBe(true);
  expect(isCompletedResult.isSkipped).toBe(false);
});

test('Test daily habit with entry with the appropriate date done at start of the day', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    dailyNormalHabitWithEntry, new Date('2025-03-02T00:00:00+00:00'))
  expect(isCompletedResult.isCompleted).toBe(true);
  expect(isCompletedResult.isSkipped).toBe(false);
});

// test('Test daily habit with entry with the appropriate date done at end of the day', () => {
//   const isCompletedResult = isHabitCompletedOnDate(
//     dailyNormalHabitWithEntry, new Date('2025-03-02T23:59:59.999+00:00'))
//   expect(isCompletedResult.isCompleted).toBe(true);
//   expect(isCompletedResult.isSkipped).toBe(false);
// });

test('Test daily habit with entry with the appropriate date skipped', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    dailyNormalHabitWithEntry, new Date('2025-03-04T09:27:00+00:00'))
  expect(isCompletedResult.isCompleted).toBe(false);
  expect(isCompletedResult.isSkipped).toBe(true);
});

test('Test daily habit with entry without done or skipped', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    dailyNormalHabitWithEntry, new Date('2025-03-07T09:27:00+00:00'))
  expect(isCompletedResult.isCompleted).toBe(false);
  expect(isCompletedResult.isSkipped).toBe(false);
});

test('Test bad daily habit with entry without done or skipped', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    dailyBadHabitWithEntry, new Date('2025-03-07T09:27:00+00:00'))
  expect(isCompletedResult.isCompleted).toBe(true);
});

test('Test bad daily habit with done record', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    dailyBadHabitWithEntry, new Date('2025-03-02T09:27:00+00:00'))
  expect(isCompletedResult.isCompleted).toBe(false);
});

test('Test weekly habit with entry with the appropriate date without done', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    weeklyNormalHabitWithEntry, new Date('2025-03-02T09:27:00+00:00'))
  expect(isCompletedResult.isCompleted).toBe(false);
  expect(isCompletedResult.isSkipped).toBe(false);
});


test('Test weekly habit with entry with the appropriate date done in the week', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    weeklyNormalHabitWithEntry, new Date('2025-02-04T12:30:00+00:00'))
    console.log("isCompletedResult " + isCompletedResult);
  expect(isCompletedResult.isCompleted).toBe(true);
  expect(isCompletedResult.isSkipped).toBe(false);
});

test('Test weekly habit with entry with the appropriate date done in the week 2', () => {
  const isCompletedResult = isHabitCompletedOnDate(
    weeklyNormalHabitWithEntry, new Date('2025-02-09T12:30:00+00:00'))
  expect(isCompletedResult.isCompleted).toBe(true);
  expect(isCompletedResult.isSkipped).toBe(false);
});
 


// test('Test weekly habit with entry with the appropriate date done at end of the week', () => {
//   const isCompletedResult = isHabitCompletedOnDate(
//     weeklyNormalHabitWithEntry, new Date('2025-03-08T23:59:59.999+00:00'))
//   expect(isCompletedResult.isCompleted).toBe(true);
//   expect(isCompletedResult.isSkipped).toBe(false);
// });

// test('Test weekly habit with entry with the appropriate date skipped', () => {
//   const isCompletedResult = isHabitCompletedOnDate(
//     weeklyNormalHabitWithEntry, new Date('2025-03-16T09:27:00+00:00'))
//   expect(isCompletedResult.isCompleted).toBe(false);
//   expect(isCompletedResult.isSkipped).toBe(true);
// });

// test('Test weekly habit with entry without done or skipped', () => {
//   const isCompletedResult = isHabitCompletedOnDate(
//     weeklyNormalHabitWithEntry, new Date('2025-03-23T09:27:00+00:00'))
//   expect(isCompletedResult.isCompleted).toBe(false);
//   expect(isCompletedResult.isSkipped).toBe(false);
// });


import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Button } from '@/components/ui/button'; 
import { Card } from '@/components/ui/card';
test('test test', () => {
  const completedHabit = "x";
  expect(completedHabit).toBe("x");
});

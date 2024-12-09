import { NextResponse } from 'next/server';

export function getValidHabitNameStatuses(role: string) {
    const statuses = ['new', 'private'];
    if (role === 'admin' || role === 'moderator') {
        statuses.push('public');
        statuses.push('rejected');
    }
    return statuses;
}


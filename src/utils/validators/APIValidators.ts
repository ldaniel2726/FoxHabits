import { NextResponse } from 'next/server';

export function permissionDeniedReturn() {
    
        return NextResponse.json(
            { error: "Nincs jogosultságod az adatok lekérdezéséhez." },
            { status: 403 }
        );
}

export function badContentReturn(errorMessage: string) {
    return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
    );
}

export function stringValidator(length: number, value: string) {
    if (value !== 'string' || value.length > length || value.trim() === '') {
        return false;
    }
}

export function selectValidator(value: string, options: string[]) {
    if (!options.includes(value)) {
        return false;
    }
}

export function numberValidator(value: number) {
    if (typeof value !== 'number' || value < 0) {
        return false;
    }
}
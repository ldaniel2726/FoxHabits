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
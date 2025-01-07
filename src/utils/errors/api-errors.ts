import { NextResponse } from "next/server";

export const ApiErrors = {
  UNAUTHORIZED: {
    message: "A felhasználó nem található! Kérlek jelentkezz be.",
    status: 401,
  },
  ID_NOT_FOUND: {
    message: "A bejegyzés nem található!",
    status: 404,
  },
  INVALID_ID: {
    message: "Bejegyzés azonosítója nem található!",
    status: 400,
  },
  INVALID_ID_TYPE: {
    message: "Bejegyzés azonosítónak számnak kell lennie!",
    status: 400,
  },
  USER_AUTH_ERROR: {
    message: "Hiba történt a felhasználó azonosítása közben.",
    status: 401,
  },
  ENTRY_FETCH_ERROR: {
    message: "Hiba történt a bejegyzés lekérdezése közben.",
    status: 500,
  },
  ENTRY_NOT_FOUND: {
    message: "A bejegyzés nem található!",
    status: 404,
  },
  ENTRY_UPDATE_ERROR: {
    message: "Hiba történt a bejegyzés módosítása közben.",
    status: 500,
  },
  ENTRY_DELETE_ERROR: {
    message: "Hiba történt a bejegyzés törlése közben.",
    status: 500,
  },
};

export const createApiError = (error: keyof typeof ApiErrors) => {
  const { message, status } = ApiErrors[error];
  return NextResponse.json({ error: message }, { status });
};

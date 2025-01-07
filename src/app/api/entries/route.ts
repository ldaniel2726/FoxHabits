import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ADMIN } from "@/utils/validators/APIConstants";
import { permissionDeniedReturn } from "@/utils/validators/APIValidators";
import { ApiErrors, createApiError } from "@/utils/errors/api-errors";
import {
  entryUpdateSchema,
  validateEntryId,
} from "@/utils/validators/entry-validators";
import { z } from "zod";

// GET /api/entries ~ Az összes bejegyzés lekérdezése
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return createApiError("UNAUTHORIZED");
  }

  if (user.user_metadata?.role !== ADMIN) {
    return permissionDeniedReturn();
  }

  const { data, error } = await supabase.from("entries").select("*");
  if (error) {
    return createApiError("ENTRY_FETCH_ERROR");
  }

  return NextResponse.json(data);
}

// DELETE /api/entries/[id] ~ Egy bejegyzés törlése
export async function DELETE(request: Request) {
  const supabase = await createClient();

  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return createApiError("INVALID_ID");
  }

  if (isNaN(Number(id))) {
    return createApiError("INVALID_ID_TYPE");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return createApiError("UNAUTHORIZED");
  }

  const { data: entryData, error: entryError } = await supabase
    .from("entries")
    .select("*")
    .eq("entry_id", id)
    .single();

  if (entryError) {
    return createApiError("ENTRY_FETCH_ERROR");
  }

  if (!entryData) {
    return createApiError("ENTRY_NOT_FOUND");
  }

  if (entryData.user_id !== user?.id && user?.role !== ADMIN) {
    return permissionDeniedReturn();
  }

  const { error: deleteError } = await supabase
    .from("entries")
    .delete()
    .eq("entry_id", id);

  if (deleteError) {
    return createApiError("ENTRY_DELETE_ERROR");
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

// PATCH /api/entries/[id] ~ Egy bejegyzés módosítása
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return createApiError("ID_NOT_FOUND");
    }

    if (isNaN(Number(id))) {
      return createApiError("INVALID_ID_TYPE");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return createApiError("UNAUTHORIZED");
    }

    const { data: entryData, error: entryError } = await supabase
      .from("entries")
      .select("*")
      .eq("entry_id", id)
      .single();

    if (entryError) {
      return createApiError("ENTRY_FETCH_ERROR");
    }

    if (!entryData) {
      return createApiError("ENTRY_NOT_FOUND");
    }

    if (entryData.user_id !== user?.id && user?.role !== ADMIN) {
      return permissionDeniedReturn();
    }

    const result = await entryUpdateSchema.safeParseAsync(await request.json());

    if (!result.success) {
      return createApiError("ENTRY_UPDATE_ERROR");
    }

    const validatedData = result.data;

    const { error: updateError } = await supabase
      .from("entries")
      .update(validatedData)
      .eq("entry_id", id);

    if (updateError) {
      return createApiError("ENTRY_UPDATE_ERROR");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return createApiError("ENTRY_UPDATE_ERROR");
  }
}

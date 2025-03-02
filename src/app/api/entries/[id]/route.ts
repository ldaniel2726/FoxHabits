import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ADMIN } from "@/utils/validators/APIConstants";
import { validateEntryId } from "@/utils/validators/entry-validators";
import { ApiErrors, createApiError } from "@/utils/errors/api-errors";

// DELETE /api/entries/[id] ~ Egy bejegyzés törlése
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const entryId = context.params.id;
  const validation = validateEntryId(entryId);
  
  if (validation.error) {
    return createApiError(validation.error as keyof typeof ApiErrors);
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return createApiError("UNAUTHORIZED");
  }

  const { data: entryData, error: entryError } = await supabase
    .from("entries")
    .select("*, habits!inner(related_user_id)")
    .eq("entry_id", validation.id)
    .single();

  if (entryError) {
    console.error("Error fetching entry:", entryError);
    return createApiError("ENTRY_FETCH_ERROR");
  }

  if (!entryData) {
    return createApiError("ENTRY_NOT_FOUND");
  }

  const isAdmin = user.user_metadata?.role === ADMIN;
  const isOwner = entryData.habits.related_user_id === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json(
      { error: "Nincs jogosultságod a bejegyzés törléséhez" },
      { status: 403 }
    );
  }

  const { error: deleteError } = await supabase
    .from("entries")
    .delete()
    .eq("entry_id", validation.id);

  if (deleteError) {
    console.error("Error deleting entry:", deleteError);
    return createApiError("ENTRY_DELETE_ERROR");
  }

  return NextResponse.json({ success: true });
} 
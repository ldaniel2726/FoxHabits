import { createClient } from "@/utils/supabase/server";
import { ADMIN } from "@/utils/validators/APIConstants";
import { permissionDeniedReturn } from "@/utils/validators/APIValidators";
import { NextResponse } from "next/server";

// GET /api/reports/admin ~ A saját reportok visszaadása felhasználóknak
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Nem vagy bejelentkezve." },
      { status: 401 }
    );
  }

  const role = user.user_metadata?.role;

    if (role !== ADMIN) {
        return permissionDeniedReturn();
    }

  const { data, error } = await supabase
    .from("reports")
    .select(
      `
        requester_user_id,
        report_data,
        start_date,
        end_date,
        created_at
      `
    )
    .eq("requester_user_id", user.id)
    .eq("report_type", "admin_report");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

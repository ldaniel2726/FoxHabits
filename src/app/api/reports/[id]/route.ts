import { createClient } from "@/utils/supabase/server";
import { ADMIN } from "@/utils/validators/APIConstants";
import { NextResponse } from "next/server";


// DELETE /api/reports/[id] ~ A report törlése
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const splitted_url = url.pathname.split("/");
  const report_id = splitted_url[splitted_url.length - 1];

  if (!report_id) {
    return NextResponse.json(
      { error: "Érvénytelen report azonosító!" },
      { status: 400 }
    );
  }
  if (isNaN(Number(report_id))) {
    return NextResponse.json(
      { error: "A report azonosítónak számnak kell lennie!" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("Auth debug:", { user, userError });

  if (userError || !user) {
    return NextResponse.json(
      { error: "A felhasználó nem található! Kérlek jelentkezz be." },
      { status: 401 }
    );
  }

  const userRole = user.user_metadata?.role;

  let query = supabase
    .from("reports")
    .delete({ count: "exact" })
    .eq("report_id", report_id);

  if (userRole !== ADMIN) {
    query = query.eq("requester_user_id", user.id);
  }

  const { error, count } = await query;
  console.log("Delete debug:", { error, count });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (count === 0) {
    return NextResponse.json(
      {
        message: "A report nem létezik, vagy nincs jogosultságod a törléshez.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Sikeres törlés!" }, { status: 200 });
}
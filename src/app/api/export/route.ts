import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

function convertToCSV<T extends Record<string, unknown>>(data: T[]): string {
    if (!data.length) return "";
    const header = Object.keys(data[0]).join(",");
    const rows = data.map(row => 
        Object.values(row)
            .map(v => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
    );
    return [header, ...rows].join("\n");
}

export async function GET(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: habits, error } = await supabase
        .from("habits")
        .select("*")
        .eq("related_user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const csv = convertToCSV(habits || []);
    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="habits.csv"',
        },
    });
}

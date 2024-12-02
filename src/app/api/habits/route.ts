import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// (admin auth hiányzik)

// Minden szokás visszaadása
export async function GET() {
    const supabase = await createClient(); 
    const { data, error } = await supabase.from('habits').select('*');
  
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  
    return NextResponse.json(data);
}


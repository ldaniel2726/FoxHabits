import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const splitted_url = url.pathname.split('/');
    const habit_id = splitted_url[splitted_url.length - 1];

    const supabase = await createClient();

    // Felhasználó lekérése
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json(
            { error: 'A felhasználó nem található! Kérlek jelentkezz be.' },
            { status: 401 }
        );
    }

    // Role lekérése a user metadata-ból
    const userRole = user.user_metadata?.role;

    let query = supabase
        .from('habits')
        .select(
            `
            habit_id, 
            related_user_id, 
            habit_type, 
            interval, 
            habit_interval_type, 
            start_date, 
            is_active, 
            habit_names!inner(habit_name)
            `
        )
        .eq('habit_id', habit_id);

    // Ha nem admin, szűrés a felhasználó ID alapján
    if (userRole !== 'admin') {
        query = query.eq('related_user_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
        return NextResponse.json(
            { message: 'A szokás nem létezik, vagy nincs jogosultságod hozzá.' },
            { status: 404 }
        );
    }

    return NextResponse.json(data, { status: 200 });
}

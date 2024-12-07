import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const habit_id = url.pathname.split('/').pop();

    if (!habit_id) {
        return NextResponse.json(
            { error: 'A szokás azonosítója nem található!' },
            { status: 400 }
        );
    }
    if (isNaN(Number(habit_id))) {
        return NextResponse.json(
            { error: 'A szokás azonosítónak számnak kell lennie!' },
            { status: 400 }
        );
    }

    const supabase = await createClient();

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



export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const splitted_url = url.pathname.split('/');
    const habit_id = splitted_url[splitted_url.length - 1];

    if (!habit_id) {
        
        return NextResponse.json(
            { error: 'Érvénytelen szokás azonosító!' },
            { status: 400 }
        );
    }
    if (isNaN(Number(habit_id))) {
        return NextResponse.json(
            { error: 'A szokás azonosítónak számnak kell lennie!' },
            { status: 400 }
        );
    }

    const supabase = await createClient();

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

    const userRole = user.user_metadata?.role;

    let query = supabase
        .from('habits')
        .delete({count: 'exact'})
        .eq('habit_id', habit_id);

        if (userRole !== 'admin') {
            query = query.eq('related_user_id', user.id);
        }
    
        const { error, count } = await query;
    
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        if (count === 0) {
            return NextResponse.json(
                { message: 'A szokás nem létezik, vagy nincs jogosultságod a törléshez.' },
                { status: 404 }
            );
        }
    
        return NextResponse.json(
            { message: 'Sikeres törlés!' },
            { status: 200 }
        );
}
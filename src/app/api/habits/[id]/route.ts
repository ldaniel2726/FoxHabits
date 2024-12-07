import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// /api/habits/[id] ~ A szokás adatainak lekérdezése
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
            { message: 'A szokás nem létezik, vagy nincs jogosultságod a megtekintéséhez.' },
            { status: 404 }
        );
    }

    return NextResponse.json(data, { status: 200 });
}

// PATCH /api/habits/[id] ~ Szokás módosítása
export async function PATCH(request: Request) {
    try {
        const payload = await request.json();

        const {
            habit_name,
            habit_name_status,
            habit_type,
            interval,
            habit_interval_type,
            start_date,
            is_active,
            related_user_id,
        } = payload;

        const url = new URL(request.url);
        const splitted_url = url.pathname.split('/');
        const habit_id = splitted_url[splitted_url.length - 1];

        if (!habit_id || isNaN(Number(habit_id))) {
            return NextResponse.json(
                { error: 'Érvénytelen szokás azonosító!' },
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

        let updated_related_user_id = related_user_id;
        if (user.id !== related_user_id && user.user_metadata?.role !== 'admin') {
            updated_related_user_id = user.id;
        }

        const validHabitTypes = ['normal_habit', 'bad_habit'];
        const validHabitIntervalTypes = ['hours', 'days', 'weeks', 'months', 'years'];
        const validHabitNameStatus = ['new', 'private'];

        if (habit_name && (typeof habit_name !== 'string' || habit_name.trim() === '')) {
            return NextResponse.json({ error: 'A szokás neve kötelező, és szöveg típusúnak kell lennie.' }, { status: 400 });
        }

        if (habit_name_status && !validHabitNameStatus.includes(habit_name_status)) {
            return NextResponse.json({ error: `A szokás nevének státusza csak ${validHabitNameStatus.join(', ')} lehet.` }, { status: 400 });
        }

        if (habit_type && !validHabitTypes.includes(habit_type)) {
            return NextResponse.json({ error: `A szokás típusa csak ${validHabitTypes.join(', ')} lehet.` }, { status: 400 });
        }

        if (interval && (typeof interval !== 'number' || interval <= 0)) {
            return NextResponse.json({ error: 'Az intervallum kötelező, és pozitív számnak kell lennie.' }, { status: 400 });
        }

        if (habit_interval_type && !validHabitIntervalTypes.includes(habit_interval_type)) {
            return NextResponse.json({ error: `Az intervallum típusa csak ${validHabitIntervalTypes.join(', ')} lehet.` }, { status: 400 });
        }

        if (start_date && isNaN(Date.parse(start_date))) {
            return NextResponse.json({ error: 'A kezdési dátum érvénytelen.' }, { status: 400 });
        }

        if (is_active !== undefined && typeof is_active !== 'boolean') {
            return NextResponse.json({ error: 'Az aktivitás státusza boolean típusú kell legyen.' }, { status: 400 });
        }

        type HabitUpdates = {
            habit_name?: string;
            habit_name_status?: string;
            habit_type?: 'normal_habit' | 'bad_habit';
            interval?: number;
            habit_interval_type?: 'hours' | 'days' | 'weeks' | 'months' | 'years';
            start_date?: string;
            is_active?: boolean;
            related_user_id?: string;
        };
        
        const updates: HabitUpdates = {};
        
        if (habit_name) updates.habit_name = habit_name;
        if (habit_name_status) updates.habit_name_status = habit_name_status;
        if (habit_type) updates.habit_type = habit_type;
        if (interval) updates.interval = interval;
        if (habit_interval_type) updates.habit_interval_type = habit_interval_type;
        if (start_date) updates.start_date = start_date;
        if (is_active !== undefined) updates.is_active = is_active;
        updates.related_user_id = updated_related_user_id;
        

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'Nincs frissítendő mező.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('habits')
            .update(updates)
            .eq('habit_id', habit_id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: `Hibás kérés vagy szerverhiba: ${err}` }, { status: 500 });
    }
}


// /api/habits/[id] ~ A szokás törlése
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
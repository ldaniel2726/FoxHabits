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

export async function POST(request: Request) {
    try {
        const {
            habit_name,
            habit_name_status = 'new',
            habit_type,
            interval,
            habit_interval_type,
            start_date = new Date().toISOString(),
            is_active = true,
        } = await request.json();

        const validHabitTypes = ['normal_habit', 'bad_habit'];
        const validHabitIntervalTypes = ['hours', 'days', 'weeks', 'months', 'years'];

        if (typeof habit_name !== 'string' || habit_name.trim() === '') {
            return NextResponse.json({ error: 'A szokás neve kötelező, és szöveg típusúnak kell lennie.' }, { status: 400 });
        }

        if (!validHabitTypes.includes(habit_type)) {
            return NextResponse.json({ error: `A szokás típusa csak ${validHabitTypes.join(', ')} lehet.` }, { status: 400 });
        }

        if (typeof interval !== 'number' || interval <= 0) {
            return NextResponse.json({ error: 'Az intervallum kötelező, és pozitív számnak kell lennie.' }, { status: 400 });
        }

        if (!validHabitIntervalTypes.includes(habit_interval_type)) {
            return NextResponse.json({ error: `Az intervallum típusa csak ${validHabitIntervalTypes.join(', ')} lehet.` }, { status: 400 });
        }

        if (isNaN(Date.parse(start_date))) {
            return NextResponse.json({ error: 'A kezdési dátum érvénytelen.' }, { status: 400 });
        }

        if (typeof is_active !== 'boolean') {
            return NextResponse.json({ error: 'Az aktivitás státusza boolean típusú kell legyen.' }, { status: 400 });
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


        let habit_name_id;

        const { data: habitNameData, error: habitNameError } = await supabase
            .from('habit_names')
            .select('habit_name_id')
            .eq('habit_name', habit_name)
            .single();

        if (habitNameError && habitNameError.code !== 'PGRST116') {
            return NextResponse.json({ error: habitNameError.message }, { status: 500 });
        }

        if (!habitNameData) {
            const { data: newHabitNameData, error: newHabitNameError } = await supabase
                .from('habit_names')
                .insert([
                    { 
                        habit_name,
                        habit_name_status,
                        sender_user_id: user.id,
                    }
                ])
                .select('habit_name_id')
                .single();

            if (newHabitNameError) {
                return NextResponse.json({ error: newHabitNameError.message }, { status: 500 });
            }

            habit_name_id = newHabitNameData.habit_name_id;
        } else {
            habit_name_id = habitNameData.habit_name_id;
        }


        const { data, error } = await supabase
            .from('habits')
            .insert([
                {
                    related_user_id: user.id,
                    habit_type,
                    interval,
                    habit_interval_type,
                    start_date,
                    is_active,
                    habit_name_id,
                }
            ])
            .select('habit_id')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Hibás kérés vagy szerverhiba.' }, { status: 500 });
    }
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
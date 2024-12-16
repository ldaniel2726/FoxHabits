import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from "zod";

// GET /api/habits/[id] ~ A szokás adatainak lekérdezése
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
        const habitUpdateSchema = z.object({
            habit_name: z.string().min(1).max(255).optional(),
            habit_name_status: z.enum(['new', 'private', 'public', 'rejected']).optional(),
            habit_type: z.enum(['normal_habit', 'bad_habit']).optional(),
            interval: z.number().positive().optional(),
            habit_interval_type: z.enum(['hours', 'days', 'weeks', 'months', 'years']).optional(),
            start_date: z.string().datetime().optional(),
            is_active: z.boolean().optional(),
            related_user_id: z.string().optional(),
        });

        const result = habitUpdateSchema.safeParse(await request.json());
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const validatedData = result.data;

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

        let updated_related_user_id = validatedData.related_user_id;
        if (user.id !== validatedData.related_user_id && user.user_metadata?.role !== 'admin') {
            updated_related_user_id = user.id;
        }

        const { data: habitData, error: habitError } = await supabase
            .from('habits')
            .select('related_user_id')
            .eq('habit_id', habit_id)
            .single();

        if (habitError) {
            return NextResponse.json({ error: habitError.message }, { status: 500 });
        }

        if (!habitData || habitData.related_user_id !== user.id) {
            return NextResponse.json(
                { error: 'Nincs jogosultságod a szokás módosításához.' },
                { status: 403 }
            );
        }

        // Ellenőrizzük a habit_name_status jogosultságot
        if (validatedData.habit_name_status) {
            const validHabitNameStatus = ['new', 'private'];
            if (user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'moderator') {
                validHabitNameStatus.push('public', 'rejected');
            }

            if (!validHabitNameStatus.includes(validatedData.habit_name_status)) {
                return NextResponse.json(
                    { error: `A szokás nevének státusza csak ${validHabitNameStatus.join(', ')} lehet.` },
                    { status: 400 }
                );
            }
        }

        type HabitUpdates = {
            habit_type?: 'normal_habit' | 'bad_habit';
            interval?: number;
            habit_interval_type?: 'hours' | 'days' | 'weeks' | 'months' | 'years';
            start_date?: string;
            is_active?: boolean;
            related_user_id?: string;
            habit_name_id?: number;
        };

        const updates: HabitUpdates = {};

        let habit_name_id;

        if (validatedData.habit_name) {
            const { data: habitNameData, error: habitNameError } = await supabase
                .from('habit_names')
                .select('habit_name_id')
                .eq('habit_name', validatedData.habit_name)
                .single();

            if (habitNameError) {
                return NextResponse.json({ error: habitNameError.message }, { status: 500 });
            }

            if (!habitNameData) {
                const habit_name_status_new = validatedData.habit_name_status || 'new';
                const { data: newHabitNameData, error: newHabitNameError } = await supabase
                    .from('habit_names')
                    .insert([{
                        habit_name: validatedData.habit_name,
                        habit_name_status: habit_name_status_new,
                        sender_user_id: user.id
                    }])
                    .select('habit_name_id')
                    .single();

                if (newHabitNameError) {
                    return NextResponse.json({ error: newHabitNameError.message }, { status: 500 });
                }

                habit_name_id = newHabitNameData.habit_name_id;
            } else {
                habit_name_id = habitNameData.habit_name_id;
            }

            updates.habit_name_id = habit_name_id;
        }

        // Frissítjük az updates objektumot a validált adatokkal
        if (validatedData.habit_type) updates.habit_type = validatedData.habit_type;
        if (validatedData.interval) updates.interval = validatedData.interval;
        if (validatedData.habit_interval_type) updates.habit_interval_type = validatedData.habit_interval_type;
        if (validatedData.start_date) updates.start_date = validatedData.start_date;
        if (validatedData.is_active !== undefined) updates.is_active = validatedData.is_active;
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


// DELETE /api/habits/[id] ~ A szokás törlése
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
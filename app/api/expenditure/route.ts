import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "not logged in" }, { status: 401 })
            const { category, item, amount } = await req.json()
        if (!category || !item || !(Number(amount) >= 0)) {
            return NextResponse.json({ error: "invalid input" }, { status: 400 })
        }
        const { data, error } = await supabase.from("expenditure").insert({ category, item, amount: Number(amount) }).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
            return NextResponse.json(data, { status: 201 })
        } catch (err) {
            console.error(err)
            return NextResponse.json({ error: String(err) }, { status: 500 })
        }
}
export async function GET() {
const supabase = await createClient()
const { data, error } = await supabase.from('expenditure').select('*').order('created_at', { ascending: false })
if (error) return NextResponse.json({ error: error.message }, { status: 500 })
return NextResponse.json(data)
}

export async function DELETE(req: Request) {
const supabase = await createClient()
const id = new URL(req.url).searchParams.get("id")
if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 })
const { error } = await supabase.from("expenditure").delete().eq("id", id)
if (error) return NextResponse.json({ error: error.message }, { status: 500 })
return NextResponse.json({ ok: true })
}
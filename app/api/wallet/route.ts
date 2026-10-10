import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
const money = ["balance", "salary", "bills", "groceries", "petrol", "savings", "other"] as const
export async function GET() {
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: "not logged in" }, { status: 401 })
const { data, error } = await supabase.from("wallet").select("*").eq("user_id", user.id).maybeSingle()
if (error) return NextResponse.json({ error: error.message }, { status: 500 })
return NextResponse.json(data)
}
export async function PUT(req: Request) {
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: "not logged in" }, { status: 401 })
const body = await req.json()
const row: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() }
for (const key of money) {
const value = Number(body[key])
if (!Number.isFinite(value) || value < 0) return NextResponse.json({ error: `invalid ${key}` }, { status: 400 })
row[key] = value
}
const day = Number(body.salary_day)
if (!Number.isInteger(day) || day < 1 || day > 28) return NextResponse.json({ error: "salary day must be 1 to 28" }, { status: 400 })
row.salary_day = day
row.last_confirmed_month = typeof body.last_confirmed_month === "string" && /^\d{4}-\d{2}$/.test(body.last_confirmed_month) ? body.last_confirmed_month : null
const { data, error } = await supabase.from("wallet").upsert(row, { onConflict: "user_id" }).select().single()
if (error) return NextResponse.json({ error: error.message }, { status: 500 })
return NextResponse.json(data)
}
export async function PATCH(req: Request) {
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: "not logged in" }, { status: 401 })
const body = await req.json()
const { data: row, error: readerror } = await supabase.from("wallet").select("*").eq("user_id", user.id).maybeSingle()
if (readerror) return NextResponse.json({ error: readerror.message }, { status: 500 })
if (!row) return NextResponse.json({ error: "set up your wallet first" }, { status: 400 })
const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
if (typeof body.month === "string") {
if (!/^\d{4}-\d{2}$/.test(body.month)) return NextResponse.json({ error: "invalid month" }, { status: 400 })
if (row.last_confirmed_month === body.month) return NextResponse.json({ error: "salary already confirmed for this month" }, { status: 400 })
update.balance = Number(row.balance) + Number(row.salary)
update.last_confirmed_month = body.month
} else {
const amount = Number(body.amount)
if (!Number.isFinite(amount) || amount === 0) return NextResponse.json({ error: "invalid amount" }, { status: 400 })
const next = Number(row.balance) + amount
if (next < 0) return NextResponse.json({ error: "not enough money in wallet" }, { status: 400 })
update.balance = next
}
const { data, error } = await supabase.from("wallet").update(update).eq("user_id", user.id).select().single()
if (error) return NextResponse.json({ error: error.message }, { status: 500 })
return NextResponse.json(data)
}
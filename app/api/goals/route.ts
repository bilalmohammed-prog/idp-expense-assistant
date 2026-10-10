import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
export async function GET() {
const supabase = await createClient()
const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: true })
if (error) return NextResponse.json({ error: error.message }, { status: 500 })
return NextResponse.json(data)
}
export async function POST(req: Request) {
const supabase = await createClient()
const { name, target } = await req.json()
if (typeof name !== "string" || !name.trim() || !(Number(target) > 0)) return NextResponse.json({ error: "invalid goal" }, { status: 400 })
const { data, error } = await supabase.from("goals").insert({ name: name.trim(), target: Number(target) }).select().single()
if (error) return NextResponse.json({ error: error.message }, { status: 500 })
return NextResponse.json(data, { status: 201 })
}
export async function DELETE(req: Request) {
const supabase = await createClient()
const id = new URL(req.url).searchParams.get("id")
if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 })
const { error } = await supabase.from("goals").delete().eq("id", id)
if (error) return NextResponse.json({ error: error.message }, { status: 500 })
return NextResponse.json({ ok: true })
}
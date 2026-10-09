"use client"
import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Trash2 } from "lucide-react"
type row = { id: number, category: string, item: string, amount: number, created_at: string }
export default function historypage() {
const [rows, setrows] = useState<row[]>([])
const [loading, setloading] = useState(true)
const [query, setquery] = useState("")
const [category, setcategory] = useState("all")
const load = async () => {
const res = await fetch("/api/expenditure")
if (res.ok) setrows(await res.json())
setloading(false)
}
useEffect(() => {
load()
}, [])
const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category))), [rows])
const filtered = useMemo(
() => rows.filter((r) => (category === "all" || r.category === category) && r.item.toLowerCase().includes(query.trim().toLowerCase())),
[rows, query, category]
)
const total = useMemo(() => filtered.reduce((s, r) => s + Number(r.amount), 0), [filtered])
const remove = async (id: number) => {
const res = await fetch(`/api/expenditure?id=${id}`, { method: "DELETE" })
if (res.ok) setrows((prev) => prev.filter((r) => r.id !== id))
}
const inr = (v: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(v)
const when = (v: string) => new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
return (
<div className="min-h-screen bg-background text-foreground">
<header className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-30">
<div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
<h1 className="font-bold text-xl tracking-tight">History</h1>
<Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/70 hover:bg-muted border border-border/60 text-xs font-semibold shadow-sm active:scale-95 transition-all">
<ArrowLeft className="w-4 h-4" />
<span>Dashboard</span>
</Link>
</div>
</header>
<main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
<div className="flex flex-col sm:flex-row gap-3">
<div className="relative flex-1">
<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
<input
value={query}
onChange={(e) => setquery(e.target.value)}
placeholder="Search by item..."
className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground"
/>
</div>
<select
value={category}
onChange={(e) => setcategory(e.target.value)}
className="h-11 px-4 rounded-xl border border-input bg-background/50 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
>
<option value="all">All categories</option>
{categories.map((c) => (
<option key={c} value={c}>{c}</option>
))}
</select>
</div>
<div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm">
<div className="flex items-baseline justify-between mb-4 pb-4 border-b border-border/60">
<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
{filtered.length} {filtered.length === 1 ? "transaction" : "transactions"}
</span>
<span className="text-2xl font-extrabold tracking-tight tabular-nums">₹ {inr(total)}</span>
</div>
{loading ? (
<p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
) : filtered.length === 0 ? (
<p className="text-sm text-muted-foreground text-center py-8">No expenses found.</p>
) : (
<ul className="space-y-2">
{filtered.map((r) => (
<li key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/60 transition-colors">
<div className="min-w-0">
<p className="font-semibold text-sm truncate">{r.item}</p>
<p className="text-[11px] text-muted-foreground">{r.category} · {when(r.created_at)}</p>
</div>
<div className="flex items-center gap-3 flex-shrink-0">
<span className="font-bold text-sm tabular-nums">₹ {inr(Number(r.amount))}</span>
<button
type="button"
onClick={() => remove(r.id)}
className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
title="Delete expense"
>
<Trash2 className="w-3.5 h-3.5" />
</button>
</div>
</li>
))}
</ul>
)}
</div>
</main>
</div>
)
}
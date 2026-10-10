"use client"
import React, { useEffect, useMemo, useState } from "react"
import { BellRing, Check, Pencil, Plus, Target, Trash2, Wallet } from "lucide-react"
type walletrow = {
balance: number
salary: number
salary_day: number
bills: number
groceries: number
petrol: number
savings: number
other: number
last_confirmed_month: string | null
}
type goal = { id: number, name: string, target: number }
const fields = [
{ key: "balance", label: "Money in your account / wallet right now" },
{ key: "salary", label: "Monthly salary" },
{ key: "salary_day", label: "Salary day of the month (1 to 28)" },
{ key: "bills", label: "Monthly bills" },
{ key: "groceries", label: "Monthly groceries" },
{ key: "petrol", label: "Monthly petrol / travel" },
{ key: "savings", label: "Monthly savings to keep aside" },
{ key: "other", label: "Other monthly commitments" },
] as const
type formkey = (typeof fields)[number]["key"]
type formstate = Record<formkey, string>
const emptyform: formstate = { balance: "", salary: "", salary_day: "1", bills: "", groceries: "", petrol: "", savings: "", other: "" }
const jsonheaders = { "Content-Type": "application/json" }
const inputclass = "w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground"
const btnprimary = "h-11 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
const cardclass = "rounded-2xl border border-border bg-card text-card-foreground p-6 sm:p-8 shadow-sm"
const inr = (v: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(v)
const tonum = (v: unknown) => Number(v) || 0
const parsewallet = (w: Record<string, unknown>): walletrow => ({
balance: tonum(w.balance),
salary: tonum(w.salary),
salary_day: tonum(w.salary_day),
bills: tonum(w.bills),
groceries: tonum(w.groceries),
petrol: tonum(w.petrol),
savings: tonum(w.savings),
other: tonum(w.other),
last_confirmed_month: (w.last_confirmed_month as string | null) ?? null,
})
export default function HomePage() {
const [wallet, setwallet] = useState<walletrow | null>(null)
const [goals, setgoals] = useState<goal[]>([])
const [loading, setloading] = useState(true)
const [showsetup, setshowsetup] = useState(false)
const [form, setform] = useState<formstate>(emptyform)
const [addamount, setaddamount] = useState("")
const [goalname, setgoalname] = useState("")
const [goaltarget, setgoaltarget] = useState("")
const [dismissed, setdismissed] = useState(false)
const [error, seterror] = useState("")
const today = new Date()
const monthkey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
const load = async () => {
const [wres, gres] = await Promise.all([fetch("/api/wallet"), fetch("/api/goals")])
if (wres.ok) {
const w = await wres.json()
setwallet(w ? parsewallet(w) : null)
}
if (gres.ok) {
const rows = await gres.json()
setgoals(rows.map((r: Record<string, unknown>) => ({ id: tonum(r.id), name: String(r.name), target: tonum(r.target) })))
}
setloading(false)
}
useEffect(() => {
load()
}, [])
const reserved = wallet ? wallet.bills + wallet.groceries + wallet.petrol + wallet.savings + wallet.other : 0
const safe = wallet ? Math.max(0, wallet.balance - reserved) : 0
const plan = useMemo(() => {
let left = safe
return goals.map((g) => {
const used = Math.min(g.target, left)
left -= used
return { ...g, used, pct: (used / g.target) * 100, ready: used >= g.target }
})
}, [goals, safe])
const salarydue = !!wallet && wallet.salary > 0 && today.getDate() >= wallet.salary_day && wallet.last_confirmed_month !== monthkey && !dismissed
const openedit = () => {
if (!wallet) return
setform({
balance: String(wallet.balance),
salary: String(wallet.salary),
salary_day: String(wallet.salary_day),
bills: String(wallet.bills),
groceries: String(wallet.groceries),
petrol: String(wallet.petrol),
savings: String(wallet.savings),
other: String(wallet.other),
})
seterror("")
setshowsetup(true)
}
const savesetup = async (e: React.FormEvent) => {
e.preventDefault()
seterror("")
const day = Math.floor(tonum(form.salary_day))
if (day < 1 || day > 28) return seterror("salary day must be between 1 and 28")
const confirmed = wallet ? wallet.last_confirmed_month : today.getDate() >= day ? monthkey : null
const res = await fetch("/api/wallet", {
method: "PUT",
headers: jsonheaders,
body: JSON.stringify({
balance: tonum(form.balance),
salary: tonum(form.salary),
salary_day: day,
bills: tonum(form.bills),
groceries: tonum(form.groceries),
petrol: tonum(form.petrol),
savings: tonum(form.savings),
other: tonum(form.other),
last_confirmed_month: confirmed,
}),
})
if (!res.ok) return seterror((await res.json()).error || "could not save")
setshowsetup(false)
await load()
}
const confirmsalary = async () => {
seterror("")
const res = await fetch("/api/wallet", { method: "PATCH", headers: jsonheaders, body: JSON.stringify({ month: monthkey }) })
if (!res.ok) return seterror((await res.json()).error || "could not confirm salary")
await load()
}
const addmoney = async (e: React.FormEvent) => {
e.preventDefault()
seterror("")
const amount = Number(addamount)
if (!(amount > 0)) return
const res = await fetch("/api/wallet", { method: "PATCH", headers: jsonheaders, body: JSON.stringify({ amount }) })
if (!res.ok) return seterror((await res.json()).error || "could not add money")
setaddamount("")
await load()
}
const addgoal = async (e: React.FormEvent) => {
e.preventDefault()
seterror("")
const target = Number(goaltarget)
if (!goalname.trim() || !(target > 0)) return
const res = await fetch("/api/goals", { method: "POST", headers: jsonheaders, body: JSON.stringify({ name: goalname.trim(), target }) })
if (!res.ok) return seterror((await res.json()).error || "could not add goal")
setgoalname("")
setgoaltarget("")
await load()
}
const removegoal = async (id: number) => {
const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" })
if (res.ok) await load()
}
const bought = async (g: goal) => {
if (!window.confirm(`Mark "${g.name}" as bought? ₹ ${inr(g.target)} will be taken from your wallet.`)) return
seterror("")
const res = await fetch("/api/wallet", { method: "PATCH", headers: jsonheaders, body: JSON.stringify({ amount: -g.target }) })
if (!res.ok) return seterror((await res.json()).error || "could not update wallet")
await fetch(`/api/goals?id=${g.id}`, { method: "DELETE" })
await load()
}
if (loading) {
return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm text-muted-foreground">Loading...</div>
}
if (!wallet || showsetup) {
return (
<main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
<form onSubmit={savesetup} className={`${cardclass} space-y-5`}>
<div>
<h1 className="text-2xl font-bold tracking-tight">{wallet ? "Edit your plan" : "Set up your wallet"}</h1>
<p className="text-xs text-muted-foreground mt-1">
Monthly amounts are held back every month, so your goals are only counted from money that is truly free to spend.
</p>
</div>
{fields.map((f) => (
<div key={f.key} className="space-y-1.5">
<label htmlFor={f.key} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{f.label}</label>
<input
id={f.key}
type="number"
min={f.key === "salary_day" ? 1 : 0}
max={f.key === "salary_day" ? 28 : undefined}
step="any"
required={f.key === "balance" || f.key === "salary" || f.key === "salary_day"}
value={form[f.key]}
onChange={(e) => setform({ ...form, [f.key]: e.target.value })}
placeholder="0"
className={inputclass}
/>
</div>
))}
{error && <p className="text-sm text-destructive">{error}</p>}
<div className="flex gap-3">
{wallet && (
<button type="button" onClick={() => setshowsetup(false)} className="flex-1 h-11 rounded-xl border border-input bg-background hover:bg-muted font-semibold text-sm cursor-pointer">
Cancel
</button>
)}
<button type="submit" className={`flex-1 ${btnprimary}`}>Save</button>
</div>
</form>
</main>
)
}
return (
<main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
{salarydue && (
<div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
<div className="flex items-center gap-3">
<div className="p-2 rounded-lg bg-primary/20 text-primary">
<BellRing className="w-5 h-5" />
</div>
<div>
<p className="font-bold text-sm">Did you receive your salary this month?</p>
<p className="text-xs text-muted-foreground">₹ {inr(wallet.salary)} will be added to your wallet when you confirm.</p>
</div>
</div>
<div className="flex gap-2">
<button type="button" onClick={() => setdismissed(true)} className="h-11 px-4 rounded-xl border border-input bg-background hover:bg-muted text-sm font-semibold cursor-pointer">
Not yet
</button>
<button type="button" onClick={confirmsalary} className={btnprimary}>
<Check className="w-4 h-4" />
<span>Yes, received</span>
</button>
</div>
</div>
)}
<div className={cardclass}>
<div className="flex items-start justify-between gap-4 mb-6">
<div>
<div className="flex items-center gap-2 text-muted-foreground">
<Wallet className="w-4 h-4" />
<span className="text-xs font-semibold uppercase tracking-wider">Money in wallet</span>
</div>
<div className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-1 tabular-nums">₹ {inr(wallet.balance)}</div>
<p className="text-xs text-muted-foreground mt-2">Salary ₹ {inr(wallet.salary)} expected on day {wallet.salary_day} of every month</p>
</div>
<button type="button" onClick={openedit} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/70 hover:bg-muted border border-border/60 text-xs font-semibold cursor-pointer">
<Pencil className="w-3.5 h-3.5" />
<span>Edit plan</span>
</button>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
<div className="p-4 rounded-xl bg-muted/30 border border-border/40">
<p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Held back each month</p>
<p className="text-xl font-bold tabular-nums mt-1">₹ {inr(reserved)}</p>
<p className="text-[11px] text-muted-foreground mt-1">bills, groceries, petrol, savings, other</p>
</div>
<div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
<p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Safe to spend</p>
<p className="text-xl font-bold tabular-nums mt-1">₹ {inr(safe)}</p>
<p className="text-[11px] text-muted-foreground mt-1">wallet minus held back</p>
</div>
</div>
<form onSubmit={addmoney} className="flex gap-3">
<input type="number" min="1" step="any" required value={addamount} onChange={(e) => setaddamount(e.target.value)} placeholder="Add money to wallet (₹)" className={inputclass} />
<button type="submit" className={btnprimary}>
<Plus className="w-4 h-4" />
<span>Add</span>
</button>
</form>
{error && <p className="text-sm text-destructive mt-3">{error}</p>}
</div>
<div className={`${cardclass} space-y-6`}>
<div className="flex items-center gap-2">
<div className="p-2 rounded-lg bg-primary/10 text-primary">
<Target className="w-5 h-5" />
</div>
<div>
<h2 className="text-lg sm:text-xl font-bold tracking-tight">Your goals</h2>
<p className="text-xs text-muted-foreground">Goals fill in the order you add them, and only from safe-to-spend money.</p>
</div>
</div>
<form onSubmit={addgoal} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
<input value={goalname} onChange={(e) => setgoalname(e.target.value)} placeholder="What do you want to buy?" required className={inputclass} />
<input type="number" min="1" step="any" value={goaltarget} onChange={(e) => setgoaltarget(e.target.value)} placeholder="Price (₹)" required className={inputclass} />
<button type="submit" className={btnprimary}>
<Plus className="w-4 h-4" />
<span>Add goal</span>
</button>
</form>
{plan.length === 0 ? (
<p className="text-sm text-muted-foreground text-center py-6 italic">No goals yet. Add something you want to buy.</p>
) : (
<ul className="space-y-4">
{plan.map((g) => (
<li key={g.id} className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3">
<div className="flex items-center justify-between gap-3">
<div className="min-w-0">
<p className="font-bold text-sm truncate">{g.name}</p>
<p className="text-[11px] text-muted-foreground tabular-nums">₹ {inr(g.used)} of ₹ {inr(g.target)}</p>
</div>
<div className="flex items-center gap-2 flex-shrink-0">
{g.ready && (
<button type="button" onClick={() => bought(g)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 text-xs font-semibold cursor-pointer">
<Check className="w-3.5 h-3.5" />
<span>Bought it</span>
</button>
)}
<button type="button" onClick={() => removegoal(g.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer" title="Remove goal">
<Trash2 className="w-3.5 h-3.5" />
</button>
</div>
</div>
<div className="h-3 w-full bg-muted rounded-full overflow-hidden">
<div className={`h-full rounded-full transition-all duration-500 ${g.ready ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${g.pct}%` }} />
</div>
<p className="text-xs font-semibold">
{g.ready ? "You can buy this safely without touching your monthly plans" : `₹ ${inr(g.target - g.used)} more to go · ${g.pct.toFixed(0)}%`}
</p>
</li>
))}
</ul>
)}
</div>
</main>
)
}
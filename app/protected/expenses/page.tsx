'use client'
import { useEffect, useState } from 'react'
type row = { id: number, category: string, item: string, amount: number, created_at: string }
export default function expensespage() {
const [rows, setrows] = useState<row[]>([])
const [category, setcategory] = useState('food')
const [item, setitem] = useState('')
const [amount, setamount] = useState('')
const load = async () => {
const res = await fetch('/api/expenditure')
if (res.ok) setrows(await res.json())
}
useEffect(() => { load() }, [])
const submit = async (e: React.FormEvent) => {
e.preventDefault()
const res = await fetch('/api/expenditure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category, item, amount }) })
if (res.ok) {
setitem('')
setamount('')
load()
}
}
return (
<div className="flex flex-col gap-6 w-full max-w-xl">
<form onSubmit={submit} className="flex flex-col gap-2">
<select value={category} onChange={e => setcategory(e.target.value)} className="border rounded p-2 bg-background">
<option>food</option>
<option>shopping</option>
<option>entertainment</option>
<option>stationery</option>
<option>other</option>
</select>
<input value={item} onChange={e => setitem(e.target.value)} placeholder="what was it for?" required className="border rounded p-2 bg-background" />
<input value={amount} onChange={e => setamount(e.target.value)} type="number" step="0.01" min="0" placeholder="amount" required className="border rounded p-2 bg-background" />
<button type="submit" className="border rounded p-2">add expense</button>
</form>
<ul className="flex flex-col gap-2">
{rows.map(r => (
<li key={r.id} className="flex justify-between border-b pb-1">
<span>{r.category} - {r.item}</span>
<span>₹{r.amount} · {new Date(r.created_at).toLocaleDateString()}</span>
</li>
))}
</ul>
</div>
)
}
"use client"
import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clock, ReceiptText, Wallet } from "lucide-react"
const links = [
{ href: "/dashboard", label: "Home", icon: Wallet },
{ href: "/dashboard/expenses", label: "Expenses", icon: ReceiptText },
{ href: "/dashboard/history", label: "History", icon: Clock },
]
export default function DashboardLayout({ children }: { children: ReactNode }) {
const pathname = usePathname()
return (
<div className="min-h-screen bg-background text-foreground">
<nav className="border-b border-border/40 bg-card">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-2 overflow-x-auto">
{links.map((l) => {
const active = pathname === l.href
const Icon = l.icon
return (
<Link
key={l.href}
href={l.href}
className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
>
<Icon className="w-4 h-4" />
<span>{l.label}</span>
</Link>
)
})}
</div>
</nav>
{children}
</div>
)
}
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Clock, ReceiptText, Wallet, Sun, Moon } from "lucide-react";
const links = [
{ href: "/dashboard", label: "Home", icon: Wallet },
{ href: "/dashboard/expenses", label: "Expenses", icon: ReceiptText },
{ href: "/dashboard/history", label: "History", icon: Clock },
]
export default function DashboardLayout({ children }: { children: ReactNode }) {
const pathname = usePathname()
const { resolvedTheme, setTheme } = useTheme();
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

const isDark = mounted && resolvedTheme === "dark";

const toggleTheme = () => {
  setTheme(isDark ? "light" : "dark");
};
return (
<div className="min-h-screen bg-background text-foreground">
<nav className="border-b border-border/40 bg-card">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
<div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
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

{mounted && (
  <button
    type="button"
    onClick={toggleTheme}
    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    className="flex flex-shrink-0 items-center gap-2 px-3 py-1.5 rounded-full bg-muted/70 hover:bg-muted border border-border/60 text-xs font-semibold text-foreground transition-all shadow-sm active:scale-95"
  >
    {isDark ? (
      <>
        <Sun className="w-4 h-4 text-amber-500" />
        <span>Light</span>
      </>
    ) : (
      <>
        <Moon className="w-4 h-4 text-indigo-500" />
        <span>Dark</span>
      </>
    )}
  </button>
)}
</div>
</nav>

{children}
</div>
)
}
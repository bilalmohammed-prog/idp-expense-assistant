"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowRight,
  Tag,
  ReceiptText,
  AlertCircle,
  Sun,
  Moon,
  Check,
  ShoppingBag,
  Utensils,
  CreditCard,
  Plane,
  Film,
  Package,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { useTheme } from "next-themes";

// Types
interface Expense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  date: string;
  timestamp: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
  iconName: string;
}

// Preset color options for category customization
const COLOR_PALETTE = [
  { label: "Amber", hex: "#F59E0B" },
  { label: "Blue", hex: "#3B82F6" },
  { label: "Emerald", hex: "#10B981" },
  { label: "Pink", hex: "#EC4899" },
  { label: "Violet", hex: "#8B5CF6" },
  { label: "Slate", hex: "#64748B" },
  { label: "Rose", hex: "#F43F5E" },
  { label: "Cyan", hex: "#06B6D4" },
  { label: "Orange", hex: "#F97316" },
  { label: "Indigo", hex: "#6366F1" },
  { label: "Teal", hex: "#14B8A6" },
  { label: "Fuchsia", hex: "#D946EF" },
];

// Available icons for categories
const ICON_OPTIONS = [
  { name: "Utensils", label: "Food", icon: Utensils },
  { name: "CreditCard", label: "Bills", icon: CreditCard },
  { name: "Plane", label: "Travel", icon: Plane },
  { name: "ShoppingBag", label: "Shopping", icon: ShoppingBag },
  { name: "Film", label: "Entertainment", icon: Film },
  { name: "Package", label: "Others", icon: Package },
  { name: "Tag", label: "Tag", icon: Tag },
  { name: "Sparkles", label: "Special", icon: Sparkles },
];

// Initial mock data matching the reference image perfectly
const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Food", color: "#F59E0B", iconName: "Utensils" },
  { id: "cat-2", name: "Bills", color: "#3B82F6", iconName: "CreditCard" },
  { id: "cat-3", name: "Travel", color: "#10B981", iconName: "Plane" },
  { id: "cat-4", name: "Shopping", color: "#EC4899", iconName: "ShoppingBag" },
  { id: "cat-5", name: "Entertainment", color: "#8B5CF6", iconName: "Film" },
  { id: "cat-6", name: "Others", color: "#64748B", iconName: "Package" },
];

const now = Date.now();
const INITIAL_EXPENSES: Expense[] = [
  // Food - Total ₹7,800
  { id: "exp-1", name: "Organic Grocery Store", amount: 2450, categoryId: "cat-1", date: "2026-09-14", timestamp: now - 1000 },
  { id: "exp-2", name: "Weekend Dinner & Drinks", amount: 1800, categoryId: "cat-1", date: "2026-09-13", timestamp: now - 2000 },
  { id: "exp-3", name: "Artisan Coffee & Snacks", amount: 450, categoryId: "cat-1", date: "2026-09-12", timestamp: now - 3000 },
  { id: "exp-4", name: "Supermarket Restock", amount: 2100, categoryId: "cat-1", date: "2026-09-10", timestamp: now - 4000 },
  { id: "exp-5", name: "Gourmet Lunch Delivery", amount: 1000, categoryId: "cat-1", date: "2026-09-08", timestamp: now - 5000 },

  // Bills - Total ₹5,120
  { id: "exp-6", name: "Electricity Utility Bill", amount: 2200, categoryId: "cat-2", date: "2026-09-14", timestamp: now - 1100 },
  { id: "exp-7", name: "High-Speed Fiber Net", amount: 1099, categoryId: "cat-2", date: "2026-09-11", timestamp: now - 2100 },
  { id: "exp-8", name: "Water Supply Authority", amount: 450, categoryId: "cat-2", date: "2026-09-09", timestamp: now - 3100 },
  { id: "exp-9", name: "Prepaid Mobile Recharge", amount: 799, categoryId: "cat-2", date: "2026-09-05", timestamp: now - 4100 },
  { id: "exp-10", name: "Piped Natural Gas", amount: 572, categoryId: "cat-2", date: "2026-09-02", timestamp: now - 5100 },

  // Travel - Total ₹4,320
  { id: "exp-11", name: "Flight Ticket Booking", amount: 2500, categoryId: "cat-3", date: "2026-09-14", timestamp: now - 1200 },
  { id: "exp-12", name: "Petrol / Fuel Station", amount: 1200, categoryId: "cat-3", date: "2026-09-12", timestamp: now - 2200 },
  { id: "exp-13", name: "Metro Smart Card Top-up", amount: 300, categoryId: "cat-3", date: "2026-09-09", timestamp: now - 3200 },
  { id: "exp-14", name: "City Cab Ride", amount: 320, categoryId: "cat-3", date: "2026-09-07", timestamp: now - 4200 },

  // Shopping - Total ₹3,600
  { id: "exp-15", name: "Running Shoes & Socks", amount: 2100, categoryId: "cat-4", date: "2026-09-13", timestamp: now - 1300 },
  { id: "exp-16", name: "Casual Denim Jacket", amount: 900, categoryId: "cat-4", date: "2026-09-11", timestamp: now - 2300 },
  { id: "exp-17", name: "Paperback Novels", amount: 600, categoryId: "cat-4", date: "2026-09-06", timestamp: now - 3300 },

  // Entertainment - Total ₹2,150
  { id: "exp-18", name: "IMAX Movie Tickets (x2)", amount: 750, categoryId: "cat-5", date: "2026-09-12", timestamp: now - 1400 },
  { id: "exp-19", name: "4K Streaming Subscription", amount: 649, categoryId: "cat-5", date: "2026-09-10", timestamp: now - 2400 },
  { id: "exp-20", name: "Live Comedy Show", amount: 751, categoryId: "cat-5", date: "2026-09-04", timestamp: now - 3400 },

  // Others - Total ₹1,330
  { id: "exp-21", name: "Prescription Medicine", amount: 630, categoryId: "cat-6", date: "2026-09-13", timestamp: now - 1500 },
  { id: "exp-22", name: "Desk Stationery & Pens", amount: 500, categoryId: "cat-6", date: "2026-09-10", timestamp: now - 2500 },
  { id: "exp-23", name: "Express Courier Parcel", amount: 200, categoryId: "cat-6", date: "2026-09-03", timestamp: now - 3500 },
];

export default function DashboardPage() {
  // State
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

  // Drag and Drop reordering state
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);

  // Form states for adding expense
  const [amountInput, setAmountInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [categorySelect, setCategorySelect] = useState<string>("");

  // Category Modal State (Create / Edit)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState<string>("");
  const [categoryColorInput, setCategoryColorInput] = useState<string>(COLOR_PALETTE[0].hex);
  const [categoryIconInput, setCategoryIconInput] = useState<string>("Tag");

  // View All Expenses Modal State
  const [viewAllCategory, setViewAllCategory] = useState<Category | null>(null);

  // Delete Category Modal State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Theme support (only light and dark)
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Calculations
  const totalExpenditure = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const categoryAnalytics = useMemo(() => {
    return categories.map((cat) => {
      // Sort expenses by timestamp descending (newest first)
      const catExpenses = expenses
        .filter((e) => e.categoryId === cat.id)
        .sort((a, b) => b.timestamp - a.timestamp);

      const total = catExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const percentage = totalExpenditure > 0 ? (total / totalExpenditure) * 100 : 0;

      return {
        ...cat,
        total,
        percentage,
        expenseCount: catExpenses.length,
        // Guaranteed latest 5 expenses sorted from newest to oldest
        lastFive: catExpenses.slice(0, 5),
      };
    });
  }, [categories, expenses, totalExpenditure]);

  // Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amountInput);
    if (isNaN(amountNum) || amountNum <= 0 || !nameInput.trim() || !categorySelect) {
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      name: nameInput.trim(),
      amount: amountNum,
      categoryId: categorySelect,
      date: new Date().toISOString().split("T")[0],
      timestamp: Date.now(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setAmountInput("");
    setNameInput("");
    setCategorySelect("");
  };

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryNameInput("");
    setCategoryColorInput(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].hex);
    setCategoryIconInput("Tag");
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryNameInput(cat.name);
    setCategoryColorInput(cat.color);
    setCategoryIconInput(cat.iconName || "Tag");
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) return;

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: categoryNameInput.trim(), color: categoryColorInput, iconName: categoryIconInput }
            : c
        )
      );
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: categoryNameInput.trim(),
        color: categoryColorInput,
        iconName: categoryIconInput,
      };
      setCategories((prev) => [...prev, newCat]);
    }

    setIsCategoryModalOpen(false);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    setExpenses((prev) => prev.filter((e) => e.categoryId !== categoryToDelete.id));
    setCategoryToDelete(null);
  };

  const handleDeleteExpenseItem = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  // Drag and drop handlers for category cards
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCategoryId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCategoryId !== id) {
      setDragOverCategoryId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedCategoryId(null);
    setDragOverCategoryId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedCategoryId || draggedCategoryId === targetId) {
      handleDragEnd();
      return;
    }

    setCategories((prev) => {
      const newCategories = [...prev];
      const sourceIndex = newCategories.findIndex((c) => c.id === draggedCategoryId);
      const targetIndex = newCategories.findIndex((c) => c.id === targetId);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [movedCategory] = newCategories.splice(sourceIndex, 1);
        newCategories.splice(targetIndex, 0, movedCategory);
      }
      return newCategories;
    });

    handleDragEnd();
  };

  // Helper to render dynamic icon
  const renderCategoryIcon = (iconName: string, className?: string) => {
    const iconObj = ICON_OPTIONS.find((i) => i.name === iconName);
    const IconComponent = iconObj ? iconObj.icon : Tag;
    return <IconComponent className={className || "w-5 h-5"} />;
  };

  // Format currency
  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none text-foreground">
              Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
              Track your expenses. Build a better tomorrow.
            </p>
          </div>

          {/* Theme switcher: Light / Dark Mode only */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/70 hover:bg-muted border border-border/60 text-xs font-semibold text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
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
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header subtitle on mobile */}
        <div className="sm:hidden">
          <p className="text-sm text-muted-foreground">
            Track your expenses. Build a better tomorrow.
          </p>
        </div>

        {/* Total Monthly Expenditure & Breakdown Card */}
        <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 sm:p-8 shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Expenditure
              </span>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-1 text-foreground flex items-baseline gap-2">
                <span>₹ {formatINR(totalExpenditure)}</span>
                <span className="text-sm font-normal text-muted-foreground">INR</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {expenses.length} Total {expenses.length === 1 ? "expense" : "expenses"} logged
            </div>
          </div>

          {/* Spending by Category Progress Bar */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Spending by Category
              </h2>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-6 w-full bg-muted/60 rounded-full overflow-hidden flex p-1 gap-1 border border-border/40">
              {totalExpenditure > 0 ? (
                categoryAnalytics
                  .filter((cat) => cat.percentage > 0)
                  .map((cat) => (
                    <div
                      key={cat.id}
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                      className="h-full rounded-full transition-all duration-500 relative group cursor-pointer"
                      title={`${cat.name}: ${cat.percentage.toFixed(0)}% (₹ ${formatINR(cat.total)})`}
                    />
                  ))
              ) : (
                <div className="w-full h-full bg-muted rounded-full" />
              )}
            </div>

            {/* Category Breakdown Chips / Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {categoryAnalytics.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/60 transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate text-foreground">
                      {cat.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {cat.percentage.toFixed(0)}%, ₹ {formatINR(cat.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add a New Expense Form Card */}
        <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ReceiptText className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Add a New Expense
            </h2>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Amount Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="expense-amount"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  ₹ Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    ₹
                  </span>
                  <input
                    id="expense-amount"
                    type="number"
                    min="1"
                    step="any"
                    placeholder="0"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    required
                    className="w-full h-11 pl-8 pr-4 rounded-xl border border-input bg-background/50 focus:bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Expense Name Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="expense-name"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Expense Name
                </label>
                <input
                  id="expense-name"
                  type="text"
                  placeholder="e.g., Grocery shopping, Metro card"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground"
                />
              </div>

              {/* Category Selector Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="expense-category"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Category
                </label>
                <select
                  id="expense-category"
                  value={categorySelect}
                  onChange={(e) => setCategorySelect(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Your Categories Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Your Categories
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Drag to rearrange categories. Manage spending & review transactions.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateCategory}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-sm transition-all border border-primary/20 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Category</span>
            </button>
          </div>

          {/* Categories Grid - 2 cards per row on tablets/md, 3 on lg/xl, 1 on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryAnalytics.map((cat) => {
              const isDragging = draggedCategoryId === cat.id;
              const isDragOver = dragOverCategoryId === cat.id && draggedCategoryId !== cat.id;

              return (
                <div
                  key={cat.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, cat.id)}
                  onDragOver={(e) => handleDragOver(e, cat.id)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, cat.id)}
                  className={`rounded-2xl border bg-card text-card-foreground p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group select-none ${
                    isDragging
                      ? "opacity-40 scale-[0.98] border-dashed border-primary"
                      : isDragOver
                      ? "border-primary ring-2 ring-primary/40 scale-[1.02]"
                      : "border-border"
                  }`}
                >
                  {/* Colored Top Accent Bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: cat.color }}
                  />

                  <div>
                    {/* Category Header */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3">
                        {/* Drag Handle Indicator */}
                        <div
                          className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground p-0.5 rounded transition-colors -ml-2"
                          title="Drag to rearrange"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        >
                          {renderCategoryIcon(cat.iconName, "w-5 h-5")}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-foreground leading-tight">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cat.expenseCount} {cat.expenseCount === 1 ? "expense" : "expenses"}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons (Edit & Delete) */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                          title="Edit Category"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Category Total Amount */}
                    <div className="mb-5 pb-4 border-b border-border/50">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Category Total
                      </span>
                      <div className="text-2xl font-extrabold tracking-tight text-foreground mt-0.5">
                        ₹ {formatINR(cat.total)}
                      </div>
                    </div>

                    {/* Last 5 Expenses Sub-section */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Last 5 Expenses
                      </h4>

                      {cat.lastFive.length > 0 ? (
                        <ul className="space-y-2.5">
                          {cat.lastFive.map((exp) => (
                            <li
                              key={exp.id}
                              className="flex items-center justify-between text-sm py-1 border-b border-border/30 last:border-0"
                            >
                              <span
                                className="font-medium text-foreground/90 truncate max-w-[180px] sm:max-w-[200px]"
                                title={exp.name}
                              >
                                {exp.name}
                              </span>
                              <span className="font-semibold text-foreground tabular-nums flex-shrink-0 ml-2">
                                ₹ {formatINR(exp.amount)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground py-4 text-center italic bg-muted/20 rounded-lg">
                          No expenses recorded yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* View All Link */}
                  <div className="pt-4 mt-4 border-t border-border/50 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setViewAllCategory(cat)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline group/btn cursor-pointer"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {cat.percentage.toFixed(0)}% of total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Subscriptions, Pet Care"
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Icon Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map((item) => {
                    const IconC = item.icon;
                    const isSelected = categoryIconInput === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setCategoryIconInput(item.name)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                            : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <IconC className="w-4 h-4" />
                        <span className="text-[10px] truncate max-w-full">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Palette Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Color
                </label>
                <div className="grid grid-cols-6 gap-2 pt-1">
                  {COLOR_PALETTE.map((color) => {
                    const isSelected = categoryColorInput.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setCategoryColorInput(color.hex)}
                        style={{ backgroundColor: color.hex }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-sm cursor-pointer ${
                          isSelected ? "ring-2 ring-offset-2 ring-primary scale-105" : ""
                        }`}
                        title={color.label}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-input bg-background hover:bg-muted text-foreground font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm shadow-sm transition-colors cursor-pointer"
                >
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ALL EXPENSES MODAL */}
      {viewAllCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: viewAllCategory.color }}
                >
                  {renderCategoryIcon(viewAllCategory.iconName, "w-4 h-4")}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    {viewAllCategory.name} Expenses
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    All recorded items for this category (newest first)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewAllCategory(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {expenses.filter((e) => e.categoryId === viewAllCategory.id).length > 0 ? (
                expenses
                  .filter((e) => e.categoryId === viewAllCategory.id)
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/60 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {exp.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{exp.date}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-bold text-sm text-foreground tabular-nums">
                          ₹ {formatINR(exp.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpenseItem(exp.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No expenses recorded in this category yet.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <span>
                Total: ₹{" "}
                {formatINR(
                  expenses
                    .filter((e) => e.categoryId === viewAllCategory.id)
                    .reduce((s, e) => s + e.amount, 0)
                )}
              </span>
              <button
                type="button"
                onClick={() => setViewAllCategory(null)}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CATEGORY CONFIRMATION MODAL */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-destructive/30 bg-card p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-foreground">
                Delete Category?
              </h3>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-bold text-foreground">
                  &quot;{categoryToDelete.name}&quot;
                </span>
                ? All associated expenses will also be permanently removed.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 h-11 rounded-xl border border-input bg-background hover:bg-muted text-foreground font-semibold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold text-sm shadow-sm transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

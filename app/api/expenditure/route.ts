
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "not logged in" },
        { status: 401 }
      );
    }

    const { category, item, amount } = await req.json();
    const expenseAmount = Number(amount);

    if (
      !category ||
      !item ||
      !Number.isFinite(expenseAmount) ||
      expenseAmount <= 0
    ) {
      return NextResponse.json(
        { error: "invalid input" },
        { status: 400 }
      );
    }

    // Deduct from wallet first.
    const walletResponse = await fetch(
      new URL("/api/wallet", req.url),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({ amount: -expenseAmount }),
        cache: "no-store",
      }
    );

    const walletResult = await walletResponse.json();

    if (!walletResponse.ok) {
      return NextResponse.json(
        { error: walletResult.error ?? "Wallet update failed" },
        { status: walletResponse.status }
      );
    }

    // Record the expense.
    const { data, error } = await supabase
      .from("expenditure")
      .insert({
        category,
        item,
        amount: expenseAmount,
      })
      .select()
      .single();

    if (error) {
      // Refund the wallet if saving the expense fails.
      await fetch(new URL("/api/wallet", req.url), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({ amount: expenseAmount }),
        cache: "no-store",
      });

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "not logged in" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("expenditure")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "not logged in" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const refundWallet =
      url.searchParams.get("refundWallet") === "true";

    if (!id) {
      return NextResponse.json(
        { error: "missing id" },
        { status: 400 }
      );
    }

    // Find the expense before deleting it.
    const { data: expense, error: readError } = await supabase
      .from("expenditure")
      .select("*")
      .eq("id", id)
      .single();

    if (readError || !expense) {
      return NextResponse.json(
        { error: "expense not found" },
        { status: 404 }
      );
    }

    // Refund only when the user explicitly chooses to.
    if (refundWallet) {
      const walletResponse = await fetch(
        new URL("/api/wallet", req.url),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.get("cookie") ?? "",
          },
          body: JSON.stringify({
            amount: Number(expense.amount),
          }),
          cache: "no-store",
        }
      );

      if (!walletResponse.ok) {
        const walletResult = await walletResponse.json();

        return NextResponse.json(
          {
            error:
              walletResult.error ?? "Wallet refund failed",
          },
          { status: walletResponse.status }
        );
      }
    }

    // Delete the expense record.
    const { error: deleteError } = await supabase
      .from("expenditure")
      .delete()
      .eq("id", id);

    if (deleteError) {
      // Reverse the refund if deletion failed.
      if (refundWallet) {
        await fetch(new URL("/api/wallet", req.url), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.get("cookie") ?? "",
          },
          body: JSON.stringify({
            amount: -Number(expense.amount),
          }),
          cache: "no-store",
        });
      }

      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      refunded: refundWallet,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


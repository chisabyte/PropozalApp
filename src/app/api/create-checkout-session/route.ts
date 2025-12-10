import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { createServerClient } from "@/lib/db"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { priceId, planId } = body

    if (!priceId || !planId) {
      return NextResponse.json(
        { error: "Price ID and Plan ID are required" },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get or create Stripe customer
    let { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    let customerId = subscription?.stripe_customer_id

    if (!customerId || customerId.startsWith("trial_")) {
      if (!stripe) {
        return NextResponse.json(
          { error: "Stripe is not configured" },
          { status: 500 }
        )
      }
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || undefined,
        metadata: {
          clerk_user_id: userId,
          user_id: user.id,
        },
      })

      customerId = customer.id

      // Update or create subscription record
      if (subscription) {
        await supabase
          .from("subscriptions")
          .update({
            stripe_customer_id: customerId,
          })
          .eq("id", subscription.id)
      } else {
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          stripe_customer_id: customerId,
          plan_id: planId,
          status: "active",
        })
      }
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error("Checkout session error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}


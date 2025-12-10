import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe, getPlanFromPriceId, getPlanQuota } from "@/lib/stripe"
import { createServerClient } from "@/lib/db"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        if (userId && session.subscription) {
          // Get the subscription to find the price ID
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const priceId = subscription.items.data[0]?.price.id || ''
          const plan = getPlanFromPriceId(priceId)
          const quota = getPlanQuota(plan)

          // Update subscription record
          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: session.subscription as string,
              status: "active",
              plan_id: plan,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)

          // Update user's plan field (P1.5: Free Tier)
          await supabase
            .from("users")
            .update({
              plan: plan,
              proposal_quota_monthly: quota,
              plan_started_at: new Date().toISOString(),
            })
            .eq("id", userId)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id || ''
        const plan = getPlanFromPriceId(priceId)
        const quota = getPlanQuota(plan)

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*, users(id)")
          .eq("stripe_customer_id", customerId)
          .single()

        if (sub) {
          // Update subscription
          await supabase
            .from("subscriptions")
            .update({
              status: subscription.status === "active" ? "active" : "canceled",
              plan_id: plan,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", sub.id)

          // Update user's plan if subscription is active
          if (subscription.status === "active" && sub.user_id) {
            await supabase
              .from("users")
              .update({
                plan: plan,
                proposal_quota_monthly: quota,
              })
              .eq("id", sub.user_id)
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single()

        // Cancel subscription
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)

        // Downgrade user to free plan (P1.5: Free Tier)
        if (sub?.user_id) {
          await supabase
            .from("users")
            .update({
              plan: 'free',
              proposal_quota_monthly: 3,
            })
            .eq("id", sub.user_id)
        }
        break
      }

      case "invoice.payment_succeeded": {
        // Handle successful payment
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    )
  }
}

import { NextRequest } from "next/server";
import Stripe from "stripe";
import { getServiceClient } from "@/lib/supabase";
import { PRICING } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const packId = session.metadata?.packId;

      if (userId && packId) {
        const pack = PRICING.packs.find((p) => p.id === packId);
        if (pack) {
          // Add credits
          await supabase.rpc("update_credits", {
            p_user_id: userId,
            p_delta: pack.credits,
          });

          // Record transaction
          await supabase.from("transactions").insert({
            user_id: userId,
            type: "purchase",
            amount: pack.credits,
            description: `Purchased ${pack.label} (NT$${pack.price})`,
          });
        }
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          plan: subscription.metadata?.plan || "basic",
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        }, { onConflict: "stripe_subscription_id" });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id, plan")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (sub) {
          const plan = PRICING.subscriptions.find((s) => s.id === sub.plan);
          if (plan) {
            await supabase.rpc("update_credits", {
              p_user_id: sub.user_id,
              p_delta: plan.credits,
            });

            await supabase.from("transactions").insert({
              user_id: sub.user_id,
              type: "purchase",
              amount: plan.credits,
              description: `Monthly subscription: ${plan.label}`,
            });
          }
        }
      }
      break;
    }
  }

  return Response.json({ received: true });
}

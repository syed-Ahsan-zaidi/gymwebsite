import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const isLocalHostUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

const getBaseUrl = (req: Request) => {
  const explicit = process.env.NEXT_PUBLIC_URL?.trim();
  if (explicit) {
    const normalizedExplicit = explicit.replace(/\/$/, "");
    // Production me localhost-based redirect allow mat karo.
    if (!(process.env.NODE_ENV === "production" && isLocalHostUrl(normalizedExplicit))) {
      return normalizedExplicit;
    }
  }

  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${protocol}://${host}`;

  return "http://localhost:3000";
};

export async function POST(req: Request) {
  try {
    const { amount, memberId } = await req.json();
    const baseUrl = getBaseUrl(req);

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: "FlexManage Pro - Membership Renewal",
              description: "Gym fees for 1 month access",
            },
            unit_amount: Math.round(amount * 100), 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { 
        memberId: String(memberId) 
      }, 
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/dashboard?payment=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

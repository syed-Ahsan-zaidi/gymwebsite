export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/db"; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("No signature found", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const memberId = session?.metadata?.memberId;
    const amount = session.amount_total ? session.amount_total / 100 : 0; 

    if (!memberId) {
      return new NextResponse("Member ID missing in metadata", { status: 400 });
    }

    try {
      // 1. Member Update & Get Gym ID
      const updatedMember = await db.member.update({
        where: { id: memberId },
        data: {
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
        },
        include: {
          user: true 
        }
      });

      // 2. Payment Record Create (Match with your Neon DB Screenshot)
      await db.payment.create({
        data: {
          memberId: memberId,
          amount: amount,
          status: "SUCCESS", // <--- Screenshots mein 'SUCCESS' hai, isliye humne 'PAID' ko change kar diya
          method: "STRIPE",
          // Agar database mein 'gymId' column hai toh niche wali line uncomment karein:
          // gymId: updatedMember.user.gymId 
        }
      });

      console.log(`✅ Success: Member ${memberId} activated & Payment recorded in Neon DB.`);
    } catch (dbError: any) {
      console.error("DB Update Error:", dbError.message);
      return new NextResponse("Database Error", { status: 500 });
    }
  }

  return new NextResponse("Success", { status: 200 });
}

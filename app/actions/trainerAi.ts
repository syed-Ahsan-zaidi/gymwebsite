"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getTrainerAIAdvice(prompt: string) {
  try {
    if (!process.env.GROQ_API_KEY) return "Error: API Key missing!";

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TRAINER") return "Unauthorized.";

    const userId = (session.user as any).id as string;

    const trainerProfile = await prisma.trainer.findUnique({
      where: { userId },
      select: { id: true, name: true, specialization: true, experience: true },
    });

    if (!trainerProfile) return "Trainer profile not found.";

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const today = new Date();

    const [members, bookings, classes] = await Promise.all([
      // Trainer ke assigned members with attendance, plans, payments
      prisma.member.findMany({
        where: { trainerId: trainerProfile.id },
        select: {
          name: true,
          status: true,
          expiresAt: true,
          joinedAt: true,
          fitnessGoal: true,
          phoneNumber: true,
          attendance: {
            where: { date: { gte: thirtyDaysAgo } },
            select: { date: true },
            orderBy: { date: "desc" },
          },
          plans: {
            select: { type: true, isApproved: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
          payments: {
            select: { amount: true, status: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 2,
          },
        },
        orderBy: { joinedAt: "asc" },
      }),

      // Trainer ke session bookings (last 30 days + upcoming)
      prisma.sessionBooking.findMany({
        where: {
          trainerId: trainerProfile.id,
          OR: [
            { startTime: { gte: thirtyDaysAgo } },
            { status: { in: ["PENDING", "CONFIRMED"] } },
          ],
        },
        select: {
          status: true,
          startTime: true,
          endTime: true,
          notes: true,
          member: { select: { name: true } },
        },
        orderBy: { startTime: "asc" },
      }),

      // Trainer ki active group classes with enrolled member names
      prisma.groupClass.findMany({
        where: { trainerId: trainerProfile.id, isActive: true },
        select: {
          title: true,
          classType: true,
          startTime: true,
          endTime: true,
          capacity: true,
          enrollments: {
            where: { status: "ENROLLED" },
            select: { member: { select: { name: true } } },
          },
        },
        orderBy: { startTime: "asc" },
      }),
    ]);

    // Member lines
    const memberLines = members.map((m) => {
      const expiry = m.expiresAt
        ? new Date(m.expiresAt).toLocaleDateString("en-PK")
        : "N/A";
      const isExpired = m.expiresAt && m.expiresAt < today;
      const attendanceCount = m.attendance.length;
      const lastVisit = m.attendance[0]
        ? new Date(m.attendance[0].date).toLocaleDateString("en-PK")
        : "Kabhi nahi";

      const workoutPlans = m.plans.filter((p) => p.type === "WORKOUT");
      const dietPlans = m.plans.filter((p) => p.type === "DIET");
      const planInfo =
        m.plans.length === 0
          ? "No plan"
          : `Workout Plans=${workoutPlans.length}(Approved=${workoutPlans.filter((p) => p.isApproved).length}), Diet Plans=${dietPlans.length}(Approved=${dietPlans.filter((p) => p.isApproved).length})`;

      const latestPayment = m.payments[0];
      const feeInfo = latestPayment
        ? `PKR ${latestPayment.amount} | ${latestPayment.status}`
        : "No record";

      return `• ${m.name}: Status=${m.status}${isExpired ? " (EXPIRED)" : ""}, Expiry=${expiry}, Goal=${m.fitnessGoal}, Last 30 Days Attendance=${attendanceCount}, Last Visit=${lastVisit}, Plans=[${planInfo}], Latest Fee=${feeInfo}`;
    });

    // Booking lines
    const bookingLines = bookings.map((b) => {
      const start = new Date(b.startTime).toLocaleString("en-PK");
      const end = new Date(b.endTime).toLocaleString("en-PK");
      const isUpcoming = new Date(b.startTime) > today;
      return `• ${b.member.name}: ${b.status}${isUpcoming ? " (Upcoming)" : ""}, ${start} → ${end}${b.notes ? `, Notes: ${b.notes}` : ""}`;
    });

    // Class lines
    const classLines = classes.map((c) => {
      const enrolledNames =
        c.enrollments.length > 0
          ? c.enrollments.map((e) => e.member.name).join(", ")
          : "Koi enrolled nahi";
      return `• ${c.title} (${c.classType}): ${new Date(c.startTime).toLocaleDateString("en-PK")} → ${new Date(c.endTime).toLocaleDateString("en-PK")}, Enrolled=${c.enrollments.length}/${c.capacity}, Members=[${enrolledNames}]`;
    });

    // Booking summary
    const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
    const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
    const activeMembers = members.filter((m) => m.status === "ACTIVE").length;

    const systemPrompt = `You are FlexTrainer AI, a personal assistant for gym trainer: ${trainerProfile.name} (Specialization: ${trainerProfile.specialization}, Experience: ${trainerProfile.experience} years).

You ONLY have data about THIS trainer's own members, bookings, and classes. You have NO information about other trainers or their members.

TRAINER OVERVIEW:
- Total Assigned Members: ${members.length} | Active: ${activeMembers}
- Last 30 Days Bookings: Pending=${pendingBookings}, Confirmed=${confirmedBookings}, Completed=${completedBookings}
- Active Group Classes: ${classes.length}

ASSIGNED MEMBERS:
${memberLines.length > 0 ? memberLines.join("\n") : "Koi member assign nahi hai abhi."}

SESSION BOOKINGS (Last 30 Days + Upcoming):
${bookingLines.length > 0 ? bookingLines.join("\n") : "Koi booking nahi."}

GROUP CLASSES:
${classLines.length > 0 ? classLines.join("\n") : "Koi active class nahi."}

Rules:
- CRITICAL: ONLY use the exact data provided above. NEVER invent, guess, or assume any data.
- CRITICAL: If a member name is NOT in the ASSIGNED MEMBERS list above, say: "Is naam ka koi member aapke saath assign nahi hai."
- You have NO data about other trainers or their members. If asked about another trainer's member, say: "Woh member meri list mein nahi hai."
- Answer in the same language as the question (Roman Urdu or English).
- Be concise and direct.
- If asked about attendance, use last 30 days data from the provided records only.
- If asked about plans (workout/diet), give plan counts and approval status from the data.
- If asked about bookings, mention member name, status, and time.
- If asked about group classes, mention class name, enrolled count, and member names.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
    });

    return completion.choices[0]?.message?.content ?? "No response";
  } catch (error) {
    console.error("Trainer AI Error:", error);
    return "System error! Please try again.";
  }
}

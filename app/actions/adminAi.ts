"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getAdminAIAdvice(prompt: string) {
  try {
    if (!process.env.GROQ_API_KEY) return "Error: API Key missing!";

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return "Unauthorized.";

    const gymId = (session.user as any).gymId as string | null;
    if (!gymId) return "Gym profile not found.";

    const adminEmail = session.user.email ?? "";
    const adminName = adminEmail.split("@")[0];

    const gym = await prisma.gymProfile.findUnique({
      where: { id: gymId },
      select: { gymName: true, location: true },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [members, trainers, allPayments] = await Promise.all([
      prisma.member.findMany({
        where: { user: { gymId } },
        select: {
          name: true,
          status: true,
          expiresAt: true,
          joinedAt: true,
          fitnessGoal: true,
          trainer: { select: { name: true } },
          payments: {
            select: { amount: true, status: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
          attendance: {
            where: { date: { gte: thirtyDaysAgo } },
            select: { date: true },
            orderBy: { date: "desc" },
          },
        },
        orderBy: { joinedAt: "asc" },
      }),
      prisma.trainer.findMany({
        where: { user: { gymId } },
        select: {
          name: true,
          specialization: true,
          experience: true,
          members: {
            select: { name: true, status: true },
          },
          availabilitySlots: {
            where: { isActive: true },
            select: { id: true, isRecurring: true },
          },
          classes: {
            where: { isActive: true },
            select: {
              title: true,
              classType: true,
              startTime: true,
              _count: { select: { enrollments: { where: { status: "ENROLLED" } } } },
              capacity: true,
            },
          },
          sessionBookings: {
            where: { startTime: { gte: thirtyDaysAgo } },
            select: { status: true },
          },
          requests: {
            where: { status: "PENDING" },
            select: { id: true },
          },
        },
      }),
      prisma.payment.findMany({
        where: { member: { user: { gymId } } },
        select: {
          amount: true,
          status: true,
          createdAt: true,
          member: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const today = new Date();

    const memberLines = members.map((m) => {
      const expiry = m.expiresAt
        ? new Date(m.expiresAt).toLocaleDateString("en-PK")
        : "N/A";
      const isExpired = m.expiresAt && m.expiresAt < today;
      const attendanceCount = m.attendance.length;
      const lastVisit = m.attendance[0]
        ? new Date(m.attendance[0].date).toLocaleDateString("en-PK")
        : "Kabhi nahi";
      const latestPayment = m.payments[0];
      const feeInfo = latestPayment
        ? `PKR ${latestPayment.amount} | ${latestPayment.status} | ${new Date(latestPayment.createdAt).toLocaleDateString("en-PK")}`
        : "No record";
      const pendingFees = m.payments.filter((p) => p.status === "PENDING").length;
      const assignedTrainer = m.trainer?.name ?? "Unassigned";

      return `• ${m.name}: Status=${m.status}${isExpired ? " (EXPIRED)" : ""}, Expiry=${expiry}, Trainer=${assignedTrainer}, Last 30 Days Attendance=${attendanceCount}, Last Visit=${lastVisit}, Latest Fee=${feeInfo}${pendingFees > 0 ? `, Pending Fees=${pendingFees}` : ""}`;
    });

    const trainerLines = trainers.map((t) => {
      const totalMembers = t.members.length;
      const activeMembers = t.members.filter((m) => m.status === "ACTIVE").length;
      const activeSlots = t.availabilitySlots.length;
      const recurringSlots = t.availabilitySlots.filter((s) => s.isRecurring).length;
      const bookingStats = {
        pending: t.sessionBookings.filter((b) => b.status === "PENDING").length,
        confirmed: t.sessionBookings.filter((b) => b.status === "CONFIRMED").length,
        completed: t.sessionBookings.filter((b) => b.status === "COMPLETED").length,
        cancelled: t.sessionBookings.filter((b) => b.status === "CANCELLED").length,
      };
      const activeClasses = t.classes
        .map((c) => `${c.title}(${c._count.enrollments}/${c.capacity})`)
        .join(", ") || "None";
      const pendingRequests = t.requests.length;

      return `• ${t.name}: Specialization=${t.specialization}, Experience=${t.experience} yrs, Assigned Members=${totalMembers} (Active=${activeMembers}), Availability Slots=${activeSlots} (Recurring=${recurringSlots}), Last 30 Days Bookings=[Pending=${bookingStats.pending}, Confirmed=${bookingStats.confirmed}, Completed=${bookingStats.completed}, Cancelled=${bookingStats.cancelled}], Active Classes=${activeClasses}, Pending Member Requests=${pendingRequests}`;
    });

    const activeCount = members.filter((m) => m.status === "ACTIVE").length;
    const pendingCount = members.filter((m) => m.status === "PENDING").length;
    const expiredCount = members.filter(
      (m) => m.expiresAt && m.expiresAt < today
    ).length;
    const pendingFeeCount = members.filter((m) =>
      m.payments.some((p) => p.status === "PENDING")
    ).length;

    // Branch-level payment summary
    const totalCollected = allPayments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPending = allPayments
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalRejected = allPayments
      .filter((p) => p.status === "REJECTED")
      .reduce((sum, p) => sum + p.amount, 0);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthCollected = allPayments
      .filter((p) => p.status === "SUCCESS" && new Date(p.createdAt) >= thisMonthStart)
      .reduce((sum, p) => sum + p.amount, 0);
    const thisMonthPending = allPayments
      .filter((p) => p.status === "PENDING" && new Date(p.createdAt) >= thisMonthStart)
      .reduce((sum, p) => sum + p.amount, 0);

    const paymentLines = allPayments.map(
      (p) =>
        `• ${p.member.name}: PKR ${p.amount} | ${p.status} | ${new Date(p.createdAt).toLocaleDateString("en-PK")}`
    );

    const systemPrompt = `You are FlexAdmin AI, a smart gym management assistant.
You are currently talking to the admin: ${adminName} (${adminEmail}).
You ONLY have data for ONE branch: "${gym?.gymName ?? "this gym"}" located in "${gym?.location ?? "unknown"}".
You have NO knowledge of any other gym or branch. If asked about any other branch or gym, say: "Mujhe sirf apni branch (${gym?.gymName ?? "this gym"} - ${gym?.location ?? "unknown"}) ki details available hain. Doosri branch ki information mere paas nahi hai."

BRANCH OVERVIEW:
- Total Members: ${members.length} | Active: ${activeCount} | Pending Approval: ${pendingCount} | Expired: ${expiredCount}
- Members with Pending Fees: ${pendingFeeCount}
- Total Trainers: ${trainers.length}

BRANCH PAYMENT SUMMARY:
- Total Collected (All Time): PKR ${totalCollected.toLocaleString()}
- Total Pending (All Time): PKR ${totalPending.toLocaleString()}
- Total Rejected (All Time): PKR ${totalRejected.toLocaleString()}
- This Month Collected: PKR ${thisMonthCollected.toLocaleString()}
- This Month Pending: PKR ${thisMonthPending.toLocaleString()}
- Total Payment Records: ${allPayments.length}

ALL PAYMENT RECORDS:
${paymentLines.length > 0 ? paymentLines.join("\n") : "No payments yet."}

TRAINER DETAILS:
${trainerLines.length > 0 ? trainerLines.join("\n") : "No trainers in this branch."}

MEMBER DETAILS:
${memberLines.length > 0 ? memberLines.join("\n") : "No members yet."}

Rules:
- CRITICAL: ONLY use the exact data provided above. NEVER invent, guess, or assume any member, trainer, payment, or attendance data.
- CRITICAL: If a member or trainer name is NOT found in the data above, respond ONLY with: "Is branch mein '[name]' naam ka koi member ya trainer nahi hai." Do NOT say anything else about them.
- ONLY answer using the data provided below. Never make up or assume data about any other branch.
- Answer in the same language as the question (Roman Urdu or English).
- Be concise and direct.
- If asked about a specific person, search their exact name in MEMBER DETAILS and TRAINER DETAILS. If not found, say they don't exist in this branch.
- If asked about attendance, summarize last 30 days data from the provided records only.
- If asked about fees or payments, use ONLY the BRANCH PAYMENT SUMMARY and ALL PAYMENT RECORDS above.
- If asked about trainers, mention their members, bookings, classes, and specialization from the provided data only.
- If a member has Trainer=Unassigned, clearly tell the admin: "Aap yeh kaam kar saktay hain — Dashboard > Members > us member ka naam click karein > Assign Trainer dropdown se trainer select karein."
- Admin hi trainer assign kar sakta hai — trainer ya member khud assign nahi kar saktay. Yeh always admin ka kaam hai.
- Agar koi action admin ko karna ho (assign trainer, approve payment, approve member), to clearly batao ke admin ko kahan jana hai aur kya karna hai. Vague jawab mat do.
- NEVER make up statistics, counts, or names that are not explicitly in the data above.`;

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
    console.error("Admin AI Error:", error);
    return "System error! Please try again.";
  }
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getSuperAdminAIAdvice(prompt: string) {
  try {
    if (!process.env.GROQ_API_KEY) return "Error: API Key missing!";

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") return "Unauthorized.";

    const adminEmail = session.user.email ?? "";
    const adminName = adminEmail.split("@")[0];

    const [gyms, totalUsers, allPayments, pendingAdmins] = await Promise.all([
      // All gyms with their users, members, trainers
      prisma.gymProfile.findMany({
        select: {
          gymName: true,
          location: true,
          createdAt: true,
          users: {
            select: {
              role: true,
              email: true,
              adminApprovalStatus: true,
              memberProfile: {
                select: {
                  status: true,
                  expiresAt: true,
                  payments: {
                    select: { amount: true, status: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // Total users on platform
      prisma.user.count(),

      // All payments across platform
      prisma.payment.findMany({
        select: {
          amount: true,
          status: true,
          createdAt: true,
          member: {
            select: {
              name: true,
              user: {
                select: {
                  gym: { select: { gymName: true, location: true } },
                },
              },
            },
          },
        },
      }),

      // Pending admin approval requests
      prisma.user.findMany({
        where: { role: "ADMIN", adminApprovalStatus: "PENDING" },
        select: { email: true, createdAt: true },
      }),
    ]);

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's payments
    const todayPayments = allPayments.filter(
      (p) => p.status === "SUCCESS" && new Date(p.createdAt) >= todayStart
    );
    const todayCollected = todayPayments.reduce((s, p) => s + p.amount, 0);

    const todayPaymentLines =
      todayPayments.length > 0
        ? todayPayments.map(
            (p) =>
              `• Member: ${p.member?.name ?? "Unknown"} | Branch: ${p.member?.user?.gym?.gymName ?? "Unknown Gym"} | Amount: PKR ${p.amount.toLocaleString()} | Time: ${new Date(p.createdAt).toLocaleTimeString("en-PK")}`
          )
        : ["No payments received today."];

    // Per-branch summary for today
    const todayBranchMap: Record<string, number> = {};
    for (const p of todayPayments) {
      const gym = p.member?.user?.gym?.gymName ?? "Unknown Gym";
      todayBranchMap[gym] = (todayBranchMap[gym] ?? 0) + p.amount;
    }
    const todayBranchLines =
      Object.keys(todayBranchMap).length > 0
        ? Object.entries(todayBranchMap).map(
            ([gym, total]) => `• ${gym}: PKR ${total.toLocaleString()}`
          )
        : ["No branch payments today."];

    // Per-month per-gym breakdown (last 6 months)
    const monthGymMap: Record<string, Record<string, number>> = {};
    const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    for (const p of allPayments) {
      if (p.status !== "SUCCESS") continue;
      const d = new Date(p.createdAt);
      const monthKey = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      const gymName = p.member?.user?.gym?.gymName ?? "Unknown Gym";
      if (!monthGymMap[monthKey]) monthGymMap[monthKey] = {};
      monthGymMap[monthKey][gymName] = (monthGymMap[monthKey][gymName] ?? 0) + p.amount;
    }
    // Build sorted month lines (most recent first, last 6 months)
    const monthlyBreakdownLines: string[] = [];
    const sortedMonths = Object.keys(monthGymMap).sort((a, b) => {
      const [am, ay] = a.split(" "); const [bm, by] = b.split(" ");
      return Number(by) - Number(ay) || MONTH_NAMES.indexOf(bm) - MONTH_NAMES.indexOf(am);
    }).slice(0, 6);
    for (const month of sortedMonths) {
      const gyms = monthGymMap[month];
      const monthTotal = Object.values(gyms).reduce((s, v) => s + v, 0);
      monthlyBreakdownLines.push(`\n${month} (Total: PKR ${monthTotal.toLocaleString()}):`);
      for (const [gym, amt] of Object.entries(gyms)) {
        monthlyBreakdownLines.push(`  • ${gym}: PKR ${amt.toLocaleString()}`);
      }
    }

    // Global payment stats
    const globalCollected = allPayments
      .filter((p) => p.status === "SUCCESS")
      .reduce((s, p) => s + p.amount, 0);
    const globalPending = allPayments
      .filter((p) => p.status === "PENDING")
      .reduce((s, p) => s + p.amount, 0);
    const globalRejected = allPayments
      .filter((p) => p.status === "REJECTED")
      .reduce((s, p) => s + p.amount, 0);
    const thisMonthCollected = allPayments
      .filter(
        (p) =>
          p.status === "SUCCESS" && new Date(p.createdAt) >= thisMonthStart
      )
      .reduce((s, p) => s + p.amount, 0);

    // Per-gym breakdown
    const gymLines = gyms.map((g) => {
      const adminUsers = g.users.filter((u) => u.role === "ADMIN");
      const admins = adminUsers.length;
      const adminEmails = adminUsers.map((u) => `${u.email.split("@")[0]} (${u.email})`).join(", ") || "None";
      const trainers = g.users.filter((u) => u.role === "TRAINER").length;
      const members = g.users.filter((u) => u.role === "MEMBER");
      const activeMembers = members.filter(
        (u) => u.memberProfile?.status === "ACTIVE"
      ).length;
      const expiredMembers = members.filter(
        (u) =>
          u.memberProfile?.expiresAt &&
          new Date(u.memberProfile.expiresAt) < today
      ).length;

      const gymPayments = members.flatMap(
        (u) => u.memberProfile?.payments ?? []
      );
      const gymCollected = gymPayments
        .filter((p) => p.status === "SUCCESS")
        .reduce((s, p) => s + p.amount, 0);
      const gymPending = gymPayments
        .filter((p) => p.status === "PENDING")
        .reduce((s, p) => s + p.amount, 0);

      return `• ${g.gymName} (${g.location}) — Joined: ${new Date(g.createdAt).toLocaleDateString("en-PK")}, Admins=${admins}(Emails: ${adminEmails}), Trainers=${trainers}, Members=${members.length}(Active=${activeMembers}, Expired=${expiredMembers}), Collected=PKR ${gymCollected.toLocaleString()}, Pending=PKR ${gymPending.toLocaleString()}`;
    });

    const pendingAdminLines =
      pendingAdmins.length > 0
        ? pendingAdmins.map(
            (a) =>
              `• ${a.email} (Requested: ${new Date(a.createdAt).toLocaleDateString("en-PK")})`
          )
        : ["None"];

    const systemPrompt = `You are SuperAdmin AI, a global platform assistant for FlexManage Pro.
You are talking to the Super Admin: ${adminName} (${adminEmail}).
You have access to ALL gyms and their data on the platform.

GLOBAL PLATFORM OVERVIEW:
- Total Gyms: ${gyms.length}
- Total Users (All Roles): ${totalUsers}
- Total Admins Pending Approval: ${pendingAdmins.length}

TODAY'S PAYMENTS (${today.toLocaleDateString("en-PK")}):
- Today's Total Collected: PKR ${todayCollected.toLocaleString()}
- Today's Payment Count: ${todayPayments.length}

TODAY'S BRANCH-WISE BREAKDOWN:
${todayBranchLines.join("\n")}

TODAY'S PAYMENT DETAILS:
${todayPaymentLines.join("\n")}

MONTHLY BRANCH-WISE PAYMENT HISTORY (last 6 months):
${monthlyBreakdownLines.length > 0 ? monthlyBreakdownLines.join("\n") : "No payment history available."}

GLOBAL PAYMENT SUMMARY:
- Total Collected (All Time): PKR ${globalCollected.toLocaleString()}
- Total Pending (All Time): PKR ${globalPending.toLocaleString()}
- Total Rejected (All Time): PKR ${globalRejected.toLocaleString()}
- This Month Collected: PKR ${thisMonthCollected.toLocaleString()}
- Total Payment Records: ${allPayments.length}

PENDING ADMIN APPROVALS:
${pendingAdminLines.join("\n")}

GYM-WISE BREAKDOWN:
${gymLines.length > 0 ? gymLines.join("\n") : "No gyms registered yet."}

Rules:
- CRITICAL: ONLY answer questions related to this platform's gyms, payments, admins, members, trainers, or stats.
- CRITICAL: If the question is NOT about this platform (e.g. general knowledge, geography, history, science, etc.), respond ONLY with: "Main sirf FlexManage Pro platform ke gyms, payments aur admin data ke baare mein jawab de sakta hoon. Koi gym-related sawal poochein."
- CRITICAL: ONLY use the exact data provided above. NEVER invent or assume any data.
- Answer in the same language as the question (Roman Urdu or English).
- Be concise and direct.
- If asked about a specific gym, find it by name and give full details.
- If asked about today's payments, revenue, or which branches paid today, ALWAYS use TODAY'S BRANCH-WISE BREAKDOWN and TODAY'S PAYMENT DETAILS — list every branch and amount clearly.
- If asked about a specific month's payments or which branches paid in a specific month, ALWAYS use MONTHLY BRANCH-WISE PAYMENT HISTORY — find the exact month and list each branch with its collected amount.
- If asked about global revenue or payments, use the GLOBAL PAYMENT SUMMARY.
- If asked about pending admins, list them from PENDING ADMIN APPROVALS.
- If asked about a gym's members or trainers, use the GYM-WISE BREAKDOWN.
- You have NO data about individual member names — only counts per gym.`;

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
    console.error("SuperAdmin AI Error:", error);
    return "System error! Please try again.";
  }
}

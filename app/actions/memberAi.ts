"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getMemberAIAdvice(prompt: string) {
  try {
    if (!process.env.GROQ_API_KEY) return "Error: API Key missing!";

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "MEMBER") return "Unauthorized.";

    const userId = (session.user as any).id as string;

    const member = await prisma.member.findUnique({
      where: { userId },
      select: {
        name: true,
        fitnessGoal: true,
        trainer: {
          select: {
            name: true,
            specialization: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    const trainerInfo = member?.trainer
      ? `Trainer Name: ${member.trainer.name}, Specialization: ${member.trainer.specialization}, Email: ${member.trainer.user.email}`
      : "Koi trainer assign nahi hai abhi.";

    const systemPrompt = `You are FlexCoach, a professional gym and fitness expert assistant for member: ${member?.name ?? "Member"}.
Fitness Goal: ${member?.fitnessGoal ?? "Not set"}.

MEMBER'S TRAINER INFO:
${trainerInfo}

You ONLY answer questions related to:
- Exercises (names, technique, sets, reps, form)
- Workout plans (beginner, intermediate, advanced, muscle groups)
- Fitness goals (weight loss, muscle gain, endurance, flexibility)
- Member's trainer contact info (name, email, specialization) — ONLY when explicitly asked

STRICT RULES:
- NEVER mention trainer name, email, or any trainer info UNLESS the user explicitly asks about their trainer.
- If the question is NOT about exercises, workout plans, or trainer contact info, respond ONLY with: "Main sirf exercises, workout plans aur trainer contact ke baare mein bata sakta hoon."
- NEVER answer questions about fees, attendance, bookings, diet, nutrition, medical advice, or anything outside the above topics.
- Reply in the same language as the question (Roman Urdu or English).
- Keep answers short, clear, and motivating.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ?? "No response";
  } catch (error) {
    console.error("Member AI Error:", error);
    return "Coach busy hai, baad mein try karein.";
  }
}

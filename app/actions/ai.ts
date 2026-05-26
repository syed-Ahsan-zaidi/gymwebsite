"use server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getAIAdvice(prompt: string) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return "Error: API Key missing!";
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are FlexCoach, a professional gym and fitness expert. You ONLY answer questions related to:
- Exercises (names, technique, sets, reps, form)
- Workout plans (beginner, intermediate, advanced, muscle groups)
- Fitness goals (weight loss, muscle gain, endurance, flexibility)

STRICT RULES:
- If the question is NOT about exercises or workout plans, respond ONLY with: "Main sirf exercises aur workout plans ke baare mein bata sakta hoon. Koi exercise ya plan poochhein."
- NEVER answer questions about fees, attendance, bookings, diet, nutrition, medical advice, or anything outside exercises and workout plans.
- Reply in the same language as the question (Roman Urdu or English).
- Keep answers short, clear, and motivating.`
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "No response";
  } catch (error) {
    console.error("Groq Error:", error);
    return "Coach busy hai, baad mein try karein.";
  }
}

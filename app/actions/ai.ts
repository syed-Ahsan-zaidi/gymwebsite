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
          content: "You are FlexCoach, a professional gym trainer. Reply in short, motivating Roman Urdu."
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

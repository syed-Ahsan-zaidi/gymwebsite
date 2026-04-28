"use server";
import { prisma } from "@/lib/prisma";

// Named Export
export const getGyms = async () => {
  try {
    const gyms = await prisma.gymProfile.findMany({
      select: { id: true, gymName: true },
    });
    return gyms;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

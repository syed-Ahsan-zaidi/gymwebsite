"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const getGyms = async () => {
  try {
    const gyms = await prisma.gymProfile.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return gyms;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

export const deleteGymAction = async (gymId: string) => {
  try {
    await prisma.gymProfile.delete({ where: { id: gymId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

export const updateGymProfile = async (gymId: string, formData: FormData, userId: string) => {
  try {
    const gymName = formData.get("gymName") as string;
    const location = formData.get("location") as string;
    const facilitiesRaw = formData.get("facilities") as string;

    const facilitiesArray = facilitiesRaw
      ? facilitiesRaw.split(",").map((f) => f.trim()).filter((f) => f !== "")
      : [];

    await prisma.gymProfile.update({
      where: { id: gymId },
      data: {
        gymName,
        location,
        facilities: facilitiesArray,
        users: { connect: { id: userId } }
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false };
  }
};

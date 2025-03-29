import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/types/server-action-response";
import type { clinics } from "@prisma/client";

const getClinics = async (): Promise<ActionResponse<{ clinics: clinics[] }>> => {
    try {
        const clinics = await prisma.clinics.findMany();
        return { success: true, data: { clinics } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getNearbyClinics = async (
    latitude: number,
    longitude: number,
): Promise<ActionResponse<{ clinics: clinics[] }>> => {
    try {
        const clinics = await prisma.clinics.findMany({
            where: {
                latitude: {
                    lt: latitude + 1,
                    gt: latitude - 1,
                },
                longitude: {
                    lt: longitude + 1,
                    gt: longitude - 1,
                },
            },
        });
        return { success: true, data: { clinics } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { getClinics, getNearbyClinics };

"use server";
import { auth } from "@/auth";
import { type vet_availability } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserId } from "./user";
import type { ActionResponse } from "@/types/server-action-response";

function getVeterinaryAvailability(): Promise<ActionResponse<{ availability: vet_availability[] }>>; // Logic for the veterinary role itself
function getVeterinaryAvailability(
    veterinarian_id: number,
): Promise<ActionResponse<{ availability: vet_availability[] }>>; // Logic for the user who wants to see the availability of a specific veterinarian

async function getVeterinaryAvailability(
    veterinarian_id?: number,
): Promise<ActionResponse<{ availability: vet_availability[] }>> {
    if (veterinarian_id !== undefined) {
        const availability = await prisma.vet_availability.findMany({
            where: {
                vet_id: veterinarian_id,
            },
        });
        return {
            success: true,
            data: {
                availability,
            },
        };
    } else {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return Promise.reject("Not authorized to view clinic veterinarians");
        }
        const user_id = await getUserId(session?.user?.email);
        const availability = await prisma.vet_availability.findMany({
            where: {
                vet_id: user_id,
            },
        });
        return {
            success: true,
            data: {
                availability,
            },
        };
    }
}

export { getVeterinaryAvailability };

"use server";

import { auth } from "@/auth";
import { AppointmentSchema } from "@/schemas/appointment-definition";
import { type appointment_type, type appointments } from "@prisma/client";
import type { ActionResponse } from "@/types/server-action-response";
import type { z } from "zod";
import { getPet } from "./pets";
import { getUserId } from "./user";
import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

async function getExistingAppointments(
    date: Date,
    vetId: number,
): Promise<ActionResponse<{ appointments: appointments[] }>> {
    try {
        const startDate = startOfDay(date);
        const endDate = endOfDay(date);
        const appointments = await prisma.appointments.findMany({
            where: {
                vet_id: vetId,
                appointment_date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        return { success: true, data: { appointments } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

const getUserAppointments = async (): Promise<ActionResponse<{ appointments: appointments[] }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }
        const appointments = await prisma.appointments.findMany({
            where: {
                pets: {
                    user_id: Number(session.user.id),
                },
            },
            include: {
                pets: true,
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
            },
        });
        return { success: true, data: { appointments } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const createUserAppointment = async (
    values: z.infer<typeof AppointmentSchema>,
): Promise<ActionResponse<{ appointment_uuid: string }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }
        const pet = await getPet(values.pet_uuid);
        if (!pet) {
            throw await Promise.reject("Pet not found");
        }
        const appointment = await prisma.appointments.create({
            data: {
                appointment_date: values.appointment_date,
                appointment_type: values.appointment_type as appointment_type,
                status: "requested",
                notes: values.notes,
                pet_id: pet.data.pet_id,
                vet_id: Number(values.vet_id),
            },
        });

        return { success: true, data: { appointment_uuid: appointment.appointment_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};
const getClinicAppointments = async (): Promise<ActionResponse<{ appointments: appointments[] }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }
        const user_id = await getUserId(session?.user?.email);
        const clinic = await prisma.clinics.findFirst({
            where: {
                user_id: user_id,
            },
        });
        if (!clinic) return { success: false, error: "Clinic not found" };
        const appointments = await prisma.appointments.findMany({
            where: {
                clinic_id: clinic.clinic_id,
            },
            include: {
                pets: {
                    include: {
                        users: true,
                    },
                },
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
                clinics: true,
            },
        });
        return { success: true, data: { appointments } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { getUserAppointments, createUserAppointment, getClinicAppointments, getExistingAppointments };

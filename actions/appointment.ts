"use server";
import { auth } from "@/auth";
import { AppointmentSchema } from "@/schemas/appointment-definition";
import { type appointment_type, type clinics, type Prisma } from "@prisma/client";
import type { ActionResponse } from "@/types/server-action-response";
import type { z } from "zod";
import { getPet } from "./pets";
import { getUserId } from "./user";
import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
type AppointmentWithRelations = Prisma.appointmentsGetPayload<{
    include: {
        pets: {
            include: {
                users: true;
            };
        };
        veterinarians: {
            include: {
                users: true;
            };
        };
        clinics: true;
    };
}>;

async function getExistingAppointments(
    date: Date,
    vetId: number
): Promise<
    ActionResponse<{
        appointments: {
            appointment_date: Date;
            duration_minutes: number;
            appointment_uuid: string;
            status: string;
        }[];
    }>
> {
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
                // Optionally exclude cancelled appointments
                // status: { not: "cancelled" }
            },
            select: {
                appointment_date: true,
                duration_minutes: true,
                appointment_uuid: true,
                status: true,
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

const getUserAppointments = async (): Promise<ActionResponse<{ appointments: AppointmentWithRelations[] }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }
        const appointments = await prisma.appointments.findMany({
            where: {
                pets: {
                    user_id: await getUserId(session?.user?.email),
                },
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

const createUserAppointment = async (
    values: z.infer<typeof AppointmentSchema>
): Promise<ActionResponse<{ appointment_uuid: string }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return { success: false, error: "User not found" };
        }
        const petResponse = await getPet(values.pet_uuid);
        if (!petResponse.success || !petResponse.data || !petResponse.data.pet) {
            return { success: false, error: "Pet not found" };
        }
        const { pet } = petResponse.data;
        if (!pet.pet_id) {
            return { success: false, error: "Invalid pet data" };
        }
        const appointment = await prisma.appointments.create({
            data: {
                appointment_date: values.appointment_date,
                appointment_type: values.appointment_type as appointment_type,
                status: "requested",
                notes: values.notes,
                pet_id: pet.pet_id,
                vet_id: Number(values.vet_id),
                clinic_id: Number(values.clinic_id),
            },
        });
        redirect(`/u/appointments/view?appointment_uuid=${appointment.appointment_uuid}`);
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getClinicAppointments = async (): Promise<ActionResponse<{ appointments: AppointmentWithRelations[] }>> => {
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

type VetAppointmentWithRelations = Prisma.appointmentsGetPayload<{
    include: {
        pets: {
            include: {
                users: true;
            };
        };
        veterinarians: {
            include: {
                users: true;
            };
        };
    };
}>;
const getVeterinarianAppointments = async (): Promise<
    ActionResponse<{
        appointments: VetAppointmentWithRelations[];
    }>
> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }
        const user_id = await getUserId(session?.user?.email);
        const veterinarian = await prisma.veterinarians.findFirst({
            where: {
                user_id: user_id,
            },
        });
        if (!veterinarian) return { success: false, error: "Veterinarian not found" };
        const appointments = await prisma.appointments.findMany({
            where: {
                vet_id: veterinarian.vet_id,
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

interface AppointmentDetails extends VetAppointmentWithRelations {
    clinics?: clinics;
}

const getAppointment = async (
    appointment_uuid: string,
    is_user: boolean = false
): Promise<ActionResponse<{ appointment: AppointmentDetails }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }
        const user_id = await getUserId(session?.user?.email);
        const appointment = await prisma.appointments.findFirst({
            where: {
                appointment_uuid: appointment_uuid,
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
                clinics: is_user,
            },
        });
        if (!appointment) {
            return { success: false, error: "Appointment not found" };
        }
        return {
            success: true,
            data: {
                appointment: {
                    ...appointment,
                    clinics: appointment.clinics ?? undefined,
                },
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const cancelAppointment = async (
    appointment_uuid: string
): Promise<ActionResponse<{ appointment_uuid: string }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return {
                success: false,
                error: "User not found",
            }
        }
        const appointment = await prisma.appointments.update({
            where: {
                appointment_uuid: appointment_uuid,
            },
            data: {
                status: "cancelled",
            },
        });
        if (!appointment) {
            return { success: false, error: "Appointment not found" };
        }
        return {
            success: true,
            data: { appointment_uuid: appointment.appointment_uuid },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export {
    getUserAppointments,
    createUserAppointment,
    getClinicAppointments,
    getExistingAppointments,
    getVeterinarianAppointments,
    getAppointment,
    cancelAppointment
};

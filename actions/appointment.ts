"use server";
import { prisma, toTitleCase } from "@/lib";
import { getClinic, getPet, getUserId, sendEmail } from "@/actions";
import { AppointmentType } from "@/schemas";
import { auth } from "@/auth";
import type { appointment_status, appointment_type, Prisma } from "@prisma/client";
import type { ActionResponse } from "@/types/server-action-response";
import { endOfDay, startOfDay } from "date-fns";
import { AppointmentDetailsResponse, GetUserAppointmentsResponse } from "@/types/actions/appointments";
import { AppointmentConfirmation, AppointmentConfirmed } from "@/templates";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";

export type AppointmentWithRelations = Prisma.appointmentsGetPayload<{
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
    vetId: number,
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
                status: { not: "cancelled" },
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

const getUserAppointments = async (): Promise<ActionResponse<{ appointments: GetUserAppointmentsResponse[] }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }

        const appointments = await prisma.appointments.findMany({
            where: {
                pets: {
                    user_id: await getUserId(session?.user?.email),
                    deleted: false,
                },
            },
            select: {
                appointment_id: true,
                appointment_uuid: true,
                appointment_date: true,
                appointment_type: true,
                notes: true,
                status: true,
                pets: {
                    select: {
                        name: true,
                    },
                },
                veterinarians: {
                    select: {
                        users: {
                            select: {
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                },
                clinics: {
                    select: {
                        name: true,
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
    values: AppointmentType,
): Promise<ActionResponse<{ appointment_uuid: string }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) return { success: false, error: "User not found" };

        const petResponse = await getPet(values.pet_uuid);
        if (!petResponse.success || !petResponse.data || !petResponse.data.pet)
            return { success: false, error: "Pet not found" };

        const { pet } = petResponse.data;
        if (!pet.pet_id) return { success: false, error: "Invalid pet data" };

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
        const vet_info = await prisma.veterinarians.findFirst({
            where: {
                vet_id: Number(values.vet_id),
            },
            select: {
                users: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });
        const pet_info = await getPet(values.pet_uuid);
        const clinic_info = await getClinic(Number(values.clinic_id));

        await sendEmail(
            AppointmentConfirmation,
            {
                appointmentType: toTitleCase(values.appointment_type),
                appointmentDate: values.appointment_date,
                clinicAddress: clinic_info.success
                    ? `${clinic_info.data?.clinic.address} + ${clinic_info.data.clinic.city} + ${clinic_info.data.clinic.state} + ${clinic_info.data.clinic.postal_code}`
                    : "",
                clinicName: clinic_info.success ? clinic_info.data?.clinic.name : "",
                petName: toTitleCase(pet_info.success ? pet_info.data?.pet.name : ""),
                ownerName: toTitleCase(`${session.user.name}`),
                vetName: `${vet_info?.users?.first_name} ${vet_info?.users?.last_name}`,
                date: new Date().toLocaleDateString(),
                time: values.appointment_time,
            },
            { to: session.user.email, subject: "Appointment Confirmation | Pawsitive Health" },
        );
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

const getClinicAppointments = async (): Promise<ActionResponse<{ appointments: AppointmentWithRelations[] }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) return { success: false, error: "User not found" };

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
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

export type VetAppointmentWithRelations = Prisma.appointmentsGetPayload<{
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
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};
const getAppointment = async (
    appointment_uuid: string,
    is_user: boolean = false,
): Promise<ActionResponse<{ appointment: AppointmentDetailsResponse }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }

        const appointment = await prisma.appointments.findFirst({
            where: {
                appointment_uuid: appointment_uuid,
            },
            select: {
                appointment_id: true,
                appointment_uuid: true,
                appointment_date: true,
                appointment_type: true,
                created_at: true,
                duration_minutes: true,
                notes: true,
                status: true,
                pets: is_user
                    ? {
                          select: {
                              name: true,
                              species: true,
                              breed: true,
                              weight_kg: true,
                          },
                      }
                    : undefined,
                veterinarians: {
                    select: {
                        specialization: true,
                        users: {
                            select: {
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                },
                clinics: is_user
                    ? {
                          select: {
                              name: true,
                              address: true,
                              city: true,
                              state: true,
                              postal_code: true,
                              phone_number: true,
                          },
                      }
                    : undefined,
            },
        });

        if (!appointment) return { success: false, error: "Appointment not found" };

        return {
            success: true,
            data: {
                appointment: appointment as unknown as AppointmentDetailsResponse,
            },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const cancelAppointment = async (appointment_uuid: string): Promise<ActionResponse<{ appointment_uuid: string }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) return { success: false, error: "User not found" };
        const appointment = await prisma.appointments.update({
            where: { appointment_uuid: appointment_uuid },
            data: { status: "cancelled" },
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
        if (!appointment.pets) return { success: false, error: "Pet not found" };
        if (!appointment.veterinarians) return { success: false, error: "Veterinarian not found" };
        if (!appointment.clinics) return { success: false, error: "Clinic not found" };
        if (!appointment) return { success: false, error: "Appointment not found" };
        if (!appointment.pets.users) return { success: false, error: "User not found." };
        await createNotification({
            userId: appointment.pets.users.user_id,
            title: "Appointment Cancelled",
            content: `Your appointment for ${appointment.pets.name} has been cancelled.`,
            type: "appointment_cancelled",
            petId: appointment.pets.pet_id,
            appointmentId: appointment.appointment_id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            actionUrl: `/u/appointments/${appointment.appointment_uuid}`,
        });
        return { success: true, data: { appointment_uuid: appointment.appointment_uuid } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const confirmAppointment = async (appointment_uuid: string): Promise<ActionResponse<{ appointment_uuid: string }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) return { success: false, error: "User not found" };

        const appointment = await prisma.appointments.update({
            where: {
                appointment_uuid: appointment_uuid,
            },
            data: {
                status: "confirmed",
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

        if (!appointment.pets) return { success: false, error: "Pet not found" };
        if (!appointment.veterinarians) return { success: false, error: "Veterinarian not found" };
        if (!appointment.clinics) return { success: false, error: "Clinic not found" };
        if (!appointment.veterinarians.users) return { success: false, error: "Veterinarian not found" };
        if (!appointment.pets.users) return { success: false, error: "User not found." };
        const ownerEmail = appointment.pets.users.email;

        const appointmentTime = new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(appointment.appointment_date);

        const appointmentDate = new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(appointment.appointment_date);
        const endDateTime = new Date(appointment.appointment_date);
        endDateTime.setMinutes(endDateTime.getMinutes() + 30);

        await sendEmail(
            AppointmentConfirmed,
            {
                petName: appointment.pets.name,
                ownerName: `${appointment.pets.users.first_name} ${appointment.pets.users.last_name}`,
                vetName: `${appointment.veterinarians.users.first_name} ${appointment.veterinarians.users.last_name}`,

                date: appointmentDate,
                time: appointmentTime,
                clinicName: appointment.clinics.name,
                clinicAddress: `${appointment.clinics.address}, ${appointment.clinics.city}, ${appointment.clinics.state} ${appointment.clinics.postal_code}`,
                clinicPhone: appointment.clinics.phone_number,
                appointmentType: toTitleCase(appointment.appointment_type),
                appointmentId: appointment.appointment_uuid,
                instructions: appointment.notes || undefined,
                appointmentDateTime: appointment.appointment_date,
                appointmentEndDateTime: endDateTime,
            },
            {
                to: ownerEmail,
                subject: `Your Appointment for ${appointment.pets.name} has been Confirmed`,
            },
        );
        await createNotification({
            userId: appointment.pets.users.user_id,
            title: "Appointment Confirmed",
            content: `Your appointment for ${appointment.pets.name} has been confirmed with ${appointment.veterinarians.users.first_name} ${appointment.veterinarians.users.last_name} at ${appointment.clinics.name}.`,
            type: "appointment_confirmation",
            petId: appointment.pets.pet_id,
            appointmentId: appointment.appointment_id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            actionUrl: `/u/appointments/${appointment.appointment_uuid}`,
        });

        return {
            success: true,
            data: { appointment_uuid: appointment.appointment_uuid },
        };
    } catch (error) {
        console.error("Error confirming appointment:", error);
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const changeAppointmentStatus = async (
    appointment_uuid: string,
    status: appointment_status,
): Promise<ActionResponse | void> => {
    try {
        const appointment = await prisma.appointments.update({
            where: {
                appointment_uuid: appointment_uuid,
            },
            data: {
                status: status,
            },
        });

        if (!appointment) return { success: false, error: "Appointment not found" };

        revalidatePath(`/v/appointments/${appointment.appointment_uuid}`);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const getAppointmentId = async (appointment_uuid: string): Promise<ActionResponse<{ appointment_id: number }>> => {
    try {
        const appointment = await prisma.appointments.findFirst({
            where: {
                appointment_uuid: appointment_uuid,
            },
            select: {
                appointment_id: true,
            },
        });

        if (!appointment) return { success: false, error: "Appointment not found" };

        return { success: true, data: { appointment_id: appointment.appointment_id } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

export {
    getUserAppointments,
    createUserAppointment,
    getClinicAppointments,
    getExistingAppointments,
    getVeterinarianAppointments,
    getAppointment,
    cancelAppointment,
    confirmAppointment,
    changeAppointmentStatus,
    getAppointmentId,
};

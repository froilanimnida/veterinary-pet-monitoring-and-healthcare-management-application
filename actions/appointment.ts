"use server";
import { prisma, toTitleCase } from "@/lib";
import { getClinic, getPet, sendEmail } from "@/actions";
import { AppointmentType } from "@/schemas";
import type {
    appointment_status,
    Prisma,
    appointment_type,
    vaccinations,
    medical_records,
    healthcare_procedures,
} from "@prisma/client";
import type { ActionResponse } from "@/types/server-action-response";
import { endOfDay, startOfDay } from "date-fns";
import { AppointmentDetailsResponse, GetUserAppointmentsResponse } from "@/types/actions/appointments";
import { AppointmentConfirmation, AppointmentConfirmed } from "@/templates";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";
import { updateGoogleCalendarEvent, deleteGoogleCalendarEvent, addToGoogleCalendar } from "./calendar-sync";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import type { PrescriptionWithMedication } from "@/types/common-prisma-join-types";

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
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");

        const appointments = await prisma.appointments.findMany({
            where: {
                pets: {
                    user_id: Number(session.user.id),
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
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id || !session.user.email) redirect("/signin");

        const petResponse = await getPet(values.pet_uuid);
        if (!petResponse.success || !petResponse.data || !petResponse.data.pet)
            return { success: false, error: "Pet not found" };

        const { pet } = petResponse.data;
        if (!pet.pet_id) return { success: false, error: "Invalid pet data" };

        // Check for conflicting appointments for the vet at this time
        const conflictingVetAppointments = await prisma.appointments.findMany({
            where: {
                vet_id: Number(values.vet_id),
                appointment_date: {
                    // Check for appointments within a 30-minute window of the selected time
                    gte: new Date(values.appointment_date.getTime() - 30 * 60 * 1000),
                    lte: new Date(values.appointment_date.getTime() + 30 * 60 * 1000),
                },
                status: { not: "cancelled" },
            },
        });

        if (conflictingVetAppointments.length > 0)
            return { success: false, error: "The veterinarian already has an appointment at this time" };

        // Check if the user has any other appointments at the same time
        const conflictingUserAppointments = await prisma.appointments.findMany({
            where: {
                pets: { user_id: Number(session.user.id) },
                appointment_date: {
                    gte: new Date(values.appointment_date.getTime() - 30 * 60 * 1000),
                    lte: new Date(values.appointment_date.getTime() + 30 * 60 * 1000),
                },
                status: { not: "cancelled" },
            },
        });

        if (conflictingUserAppointments.length > 0)
            return { success: false, error: "You already have another appointment at this time" };

        const appointment = await prisma.appointments.create({
            data: {
                pet_id: pet.pet_id,
                vet_id: Number(values.vet_id),
                clinic_id: Number(values.clinic_id),
                appointment_date: values.appointment_date,
                appointment_type: values.appointment_type as appointment_type,
                notes: values.notes,
                appointment_uuid: crypto.randomUUID(),
                status: "requested",
                duration_minutes: values.duration_minutes || 30,
            },
        });

        // Add to Google Calendar if integration is enabled
        await addToGoogleCalendar(appointment.appointment_uuid);

        // Get additional information for email
        const clinic_info = await getClinic(Number(values.clinic_id));
        const vet_info = await prisma.veterinarians.findUnique({
            where: { vet_id: Number(values.vet_id) },
            include: { users: true },
        });
        const pet_info = await getPet(values.pet_uuid);

        await sendEmail(
            AppointmentConfirmation,
            {
                appointmentType: toTitleCase(values.appointment_type),
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
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");

        const clinic = await prisma.clinics.findFirst({
            where: { user_id: Number(session.user.id) },
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
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");
        const veterinarian = await prisma.veterinarians.findFirst({
            where: { user_id: Number(session.user.id) },
        });
        if (!veterinarian) return { success: false, error: "Veterinarian not found" };
        const appointments = await prisma.appointments.findMany({
            where: { vet_id: veterinarian.vet_id },
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
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");
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
                pets: {
                    select: {
                        name: true,
                        species: true,
                        breed: true,
                        pet_id: true,
                        pet_uuid: true,
                        weight_kg: true,
                    },
                },
                veterinarians: {
                    select: {
                        specialization: true,
                        vet_id: true,
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
            data: { appointment: appointment },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const cancelAppointment = async (appointment_uuid: string): Promise<ActionResponse<{ appointment_uuid: string }>> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");
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

        // Delete from Google Calendar if integration is enabled
        await deleteGoogleCalendarEvent(appointment_uuid);

        await createNotification({
            userId: appointment.pets.users.user_id,
            title: "Appointment Cancelled",
            content: `Your appointment for ${appointment.pets.name} has been cancelled.`,
            type: "appointment_cancelled",
            petId: appointment.pets.pet_id,
            appointmentId: appointment.appointment_id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            actionUrl: `/user/appointments/${appointment.appointment_uuid}`,
        });
        return { success: true, data: { appointment_uuid: appointment.appointment_uuid } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const confirmAppointment = async (appointment_uuid: string): Promise<ActionResponse<{ appointment_uuid: string }>> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");

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
            { to: ownerEmail, subject: `Your Appointment for ${appointment.pets.name} has been Confirmed` },
        );
        await createNotification({
            userId: appointment.pets.users.user_id,
            title: "Appointment Confirmed",
            content: `Your appointment for ${appointment.pets.name} has been confirmed with ${appointment.veterinarians.users.first_name} ${appointment.veterinarians.users.last_name} at ${appointment.clinics.name}.`,
            type: "appointment_confirmation",
            petId: appointment.pets.pet_id,
            appointmentId: appointment.appointment_id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            actionUrl: `/user/appointments/${appointment.appointment_uuid}`,
        });

        return { success: true, data: { appointment_uuid: appointment.appointment_uuid } };
    } catch (error) {
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
        revalidatePath(`/vet/appointments/${appointment.appointment_uuid}`);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * Reschedule an existing appointment to a new date/time
 */
const rescheduleAppointment = async (
    appointment_uuid: string,
    new_date: Date,
    notes?: string,
): Promise<ActionResponse | void> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) redirect("/signin");

        // Get the current appointment to check who's allowed to reschedule it
        const currentAppointment = await prisma.appointments.findUnique({
            where: { appointment_uuid },
            include: {
                pets: {
                    include: { users: true },
                },
                veterinarians: {
                    include: { users: true },
                },
                clinics: true,
            },
        });

        if (!currentAppointment) return { success: false, error: "Appointment not found" };

        // Check if the status allows rescheduling
        if (currentAppointment.status === "completed" || currentAppointment.status === "cancelled")
            return { success: false, error: `Cannot reschedule a ${currentAppointment.status} appointment` };

        // Check for scheduling conflicts at the new time for this veterinarian
        const conflictingAppointments = await prisma.appointments.findMany({
            where: {
                vet_id: currentAppointment.vet_id,
                appointment_date: {
                    // Check for appointments within a 30-minute window of the new time
                    gte: new Date(new_date.getTime() - 30 * 60 * 1000),
                    lte: new Date(new_date.getTime() + 30 * 60 * 1000),
                },
                status: { not: "cancelled" },
                appointment_uuid: { not: appointment_uuid }, // Exclude the current appointment
            },
        });

        if (conflictingAppointments.length > 0)
            return { success: false, error: "There is a scheduling conflict at this time" };

        // Check if the current user has any other appointments at the same time
        const userAppointments = await prisma.appointments.findMany({
            where: {
                pets: {
                    user_id: Number(session.user.id),
                },
                appointment_date: {
                    gte: new Date(new_date.getTime() - 30 * 60 * 1000),
                    lte: new Date(new_date.getTime() + 30 * 60 * 1000),
                },
                status: { not: "cancelled" },
                appointment_uuid: { not: appointment_uuid }, // Exclude the current appointment
            },
        });

        if (userAppointments.length > 0)
            return { success: false, error: "You already have another appointment at this time" };

        // Update the appointment with the new date and notes if provided
        const updatedAppointment = await prisma.appointments.update({
            where: { appointment_uuid },
            data: {
                appointment_date: new_date,
                ...(notes !== undefined ? { notes } : {}),
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

        // If there's no pet or vet information, something went wrong
        if (!updatedAppointment.pets) return { success: false, error: "Pet not found" };
        if (!updatedAppointment.veterinarians || !updatedAppointment.veterinarians.users)
            return { success: false, error: "Veterinarian not found" };
        if (!updatedAppointment.clinics) return { success: false, error: "Clinic not found" };
        if (!updatedAppointment.pets.users) return { success: false, error: "User not found" };

        // Update the Google Calendar event if calendar sync is enabled
        await updateGoogleCalendarEvent(appointment_uuid);

        // Send notification about rescheduled appointment
        await createNotification({
            userId: updatedAppointment.pets.users.user_id,
            title: "Appointment Rescheduled",
            content: `Your appointment for ${updatedAppointment.pets.name} with ${updatedAppointment.veterinarians.users.first_name} ${updatedAppointment.veterinarians.users.last_name} has been rescheduled.`,
            type: "appointment_rescheduled",
            petId: updatedAppointment.pets.pet_id,
            appointmentId: updatedAppointment.appointment_id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            actionUrl: `/user/appointments/view/${updatedAppointment.appointment_uuid}`,
        });
        // Revalidate the appointment path to show the changes
        revalidatePath(`/user/appointments/view/${updatedAppointment.appointment_uuid}`);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * Get historical data for a specific appointment
 * This includes vaccination history, healthcare procedures, and prescriptions
 */
const getAppointmentHistoricalData = async (
    appointment_uuid: string,
): Promise<
    ActionResponse<{
        vaccinations: vaccinations[];
        healthcareProcedures: healthcare_procedures[];
        prescriptions: PrescriptionWithMedication[];
        medicalRecords: medical_records[];
    }>
> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) redirect("/signin");

        // First get the appointment to verify access and get pet_id
        const appointment = await prisma.appointments.findUnique({
            where: { appointment_uuid },
            include: {
                pets: true,
                veterinarians: {
                    include: { users: true },
                },
            },
        });

        if (!appointment) return { success: false, error: "Appointment not found" };

        // Verify that the appointment is confirmed or checked-in
        if (appointment.status !== "confirmed" && appointment.status !== "checked_in") {
            return {
                success: false,
                error: "Historical data is only available for confirmed or checked-in appointments",
            };
        }

        const petId = appointment.pet_id;
        if (!petId) return { success: false, error: "Pet information not found" };

        // Get vaccination history for the pet
        const vaccinations = await prisma.vaccinations.findMany({
            where: { pet_id: petId },
            orderBy: { administered_date: "desc" },
        });

        // Get healthcare procedures for the pet
        const healthcareProcedures = await prisma.healthcare_procedures.findMany({
            where: { pet_id: petId },
            orderBy: { procedure_date: "desc" },
        });

        // Get prescriptions for the pet
        const prescriptions = await prisma.prescriptions.findMany({
            where: { pet_id: petId },
            orderBy: { created_at: "desc" },
            include: {
                medications: true,
            },
        });

        // Get medical records for the pet
        const medicalRecords = await prisma.medical_records.findMany({
            where: { pet_id: petId },
            orderBy: { visit_date: "desc" },
        });

        return {
            success: true,
            data: {
                vaccinations,
                healthcareProcedures,
                prescriptions,
                medicalRecords,
            },
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * Get all recorded services for a specific appointment
 * This includes vaccinations, healthcare procedures, and prescriptions
 */
const getAppointmentRecordedServices = async (
    appointment_uuid: string,
): Promise<
    ActionResponse<{
        vaccinations: vaccinations[];
        healthcareProcedures: healthcare_procedures[];
        prescriptions: PrescriptionWithMedication[];
        appointment_id: number;
        petUuid: string;
    }>
> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) redirect("/signin");

        // Find the appointment first
        const appointment = await prisma.appointments.findUnique({
            where: { appointment_uuid },
            include: {
                pets: {
                    select: {
                        pet_uuid: true,
                    },
                },
            },
        });

        if (!appointment) return { success: false, error: "Appointment not found" };

        // Get vaccinations recorded for this appointment
        const vaccinations = await prisma.vaccinations.findMany({
            where: { appointment_id: appointment.appointment_id },
            orderBy: { created_at: "desc" },
        });

        // Get healthcare procedures recorded for this appointment
        const healthcareProcedures = await prisma.healthcare_procedures.findMany({
            where: { appointment_id: appointment.appointment_id },
            orderBy: { created_at: "desc" },
        });

        // Get prescriptions recorded for this appointment
        const prescriptions = await prisma.prescriptions.findMany({
            where: {
                AND: [
                    { pet_id: appointment.pet_id },
                    {
                        created_at: {
                            gte: appointment.appointment_date,
                            lte: new Date(new Date(appointment.appointment_date).getTime() + 24 * 60 * 60 * 1000),
                        },
                    },
                ],
            },
            orderBy: { created_at: "desc" },
            include: {
                medications: true,
            },
        });

        return {
            success: true,
            data: {
                vaccinations,
                healthcareProcedures,
                prescriptions,
                appointment_id: appointment.appointment_id,
                petUuid: appointment.pets?.pet_uuid || "",
            },
        };
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
    rescheduleAppointment,
    getAppointmentHistoricalData,
    getAppointmentRecordedServices,
};

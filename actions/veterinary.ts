"use server";
import { role_type, type users, type veterinarians } from "@prisma/client";
import { VeterinarianSchema } from "@/schemas/veterinarian-definition";
import { hashPassword } from "@/lib/functions/security/password-check";
import { type veterinary_specialization } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserId } from "./user";
import { ActionResponse } from "@/types/server-action-response";

const newVeterinarian = async (
    values: z.infer<typeof VeterinarianSchema>,
): Promise<ActionResponse<{ user_uuid: string; veterinarian_uuid: string }>> => {
    try {
        const formData = VeterinarianSchema.safeParse(values);
        if (!formData.success) {
            return Promise.reject("Invalid input");
        }
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return Promise.reject("Not authorized to create a veterinarian");
        }
        const user_id = await getUserId(session?.user?.email);

        const user = await prisma.users.findFirst({
            where: {
                OR: [{ email: formData.data.email }, { phone_number: formData.data.phone_number }],
            },
        });

        if (user !== null) {
            return Promise.reject("User already exists");
        }

        const clinic = await prisma.clinics.findFirst({
            where: {
                user_id: user_id,
            },
        });

        if (!clinic) {
            return Promise.reject("No clinic found for this user");
        }

        const result = await prisma.users.create({
            data: {
                email: formData.data.email,
                password_hash: await hashPassword(formData.data.password),
                first_name: formData.data.first_name,
                last_name: formData.data.last_name,
                phone_number: formData.data.phone_number,
                role: role_type.veterinarian,
            },
        });

        if (result.user_id === null) {
            return Promise.reject("Failed to create account");
        }

        const veterinarian = await prisma.veterinarians.create({
            data: {
                license_number: formData.data.license_number,
                user_id: result.user_id,
                specialization: formData.data.specialization as veterinary_specialization,
            },
        });

        await prisma.clinic_veterinarians.create({
            data: {
                clinic_id: clinic.clinic_id,
                vet_id: veterinarian.vet_id,
            },
        });

        // Optionally set up initial availability for the vet based on clinic hours
        const clinicHours = await prisma.clinic_hours.findMany({
            where: {
                clinic_id: clinic.clinic_id,
                is_closed: false,
            },
        });

        // Create default availability entries for each clinic day
        const availabilityPromises = clinicHours.map((hour) =>
            prisma.vet_availability.create({
                data: {
                    vet_id: veterinarian.vet_id,
                    clinic_id: clinic.clinic_id,
                    day_of_week: hour.day_of_week,
                    start_time: hour.opens_at,
                    end_time: hour.closes_at,
                    is_available: true,
                },
            }),
        );

        await Promise.all(availabilityPromises);

        return {
            success: true,
            data: {
                user_uuid: result.user_uuid,
                veterinarian_uuid: veterinarian.vet_uuid,
            },
        };
    } catch (error) {
        console.error("Error creating veterinarian:", error);
        return Promise.reject(error);
    }
};

const getClinicVeterinarians = async (): Promise<
    ActionResponse<{ veterinarians: (veterinarians & { users: users | null })[] }>
> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return { success: false, error: "Not authorized to view clinic veterinarians" };
        }
        const user_id = await getUserId(session?.user?.email);
        const clinic = await prisma.clinics.findFirst({
            where: {
                user_id: user_id,
            },
        });

        if (!clinic) return { success: false, error: "Clinic not found" };

        const clinicVeterinarians = await prisma.clinic_veterinarians.findMany({
            where: {
                clinic_id: clinic.clinic_id,
            },
            include: {
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
            },
        });

        const veterinarians = clinicVeterinarians.map((cv) => ({
            ...cv.veterinarians,
        }));

        return {
            success: true,
            data: {
                veterinarians,
            },
        };
    } catch (error) {
        console.error("Error getting clinic veterinarians:", error);
        return Promise.reject(error);
    }
};

const getVeterinariansByClinic = async (
    clinicId: string,
): Promise<
    ActionResponse<{ veterinarians: { id: string; name: string; specialization: veterinary_specialization }[] }>
> => {
    try {
        if (!clinicId) return { success: false, error: "Clinic ID is required" };
        const clinicVeterinarians = await prisma.clinic_veterinarians.findMany({
            where: {
                clinic_id: Number(clinicId),
            },
            include: {
                veterinarians: {
                    include: {
                        users: true,
                    },
                },
            },
        });
        if (!clinicVeterinarians || clinicVeterinarians.length === 0) {
            return { success: true, data: { veterinarians: [] } };
        }

        return clinicVeterinarians.map((cv) => ({
            id: cv.veterinarians.vet_id.toString(),
            name: cv.veterinarians.users
                ? `${cv.veterinarians.users.first_name} ${cv.veterinarians.users.last_name}`
                : "Unknown",
            specialization: cv.veterinarians.specialization,
        }));
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { newVeterinarian, getClinicVeterinarians, getVeterinariansByClinic };

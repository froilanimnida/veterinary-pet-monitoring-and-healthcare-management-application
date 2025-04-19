"use server";
import { VeterinarianSchema, VeterinarianType } from "@/schemas";
import { generateVerificationToken, hashPassword } from "@/lib";
import { prisma } from "@/lib";
import { createNewPreferenceDefault } from "@/actions";
import { role_type, type users, type veterinarians } from "@prisma/client";
import { type veterinary_specialization } from "@prisma/client";
import type { ActionResponse } from "@/types/server-action-response";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const newVeterinarian = async (
    values: VeterinarianType,
): Promise<ActionResponse<{ user_uuid: string; veterinarian_uuid: string }>> => {
    try {
        const formData = VeterinarianSchema.safeParse(values);
        if (!formData.success) return { success: false, error: "Invalid input data" };
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");

        const user = await prisma.users.findFirst({
            where: {
                OR: [{ email: formData.data.email }, { phone_number: formData.data.phone_number }],
            },
        });
        if (user !== null) return { success: false, error: "Email or phone number already exists" };
        const clinic = await prisma.clinics.findFirst({
            where: {
                user_id: Number(session.user.id),
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
                email_verified: false,
                email_verification_token: generateVerificationToken(formData.data.email),
                email_verification_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        if (result.user_id === null) return { success: false, error: "Failed to create user" };

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

        const clinicHours = await prisma.clinic_hours.findMany({
            where: {
                clinic_id: clinic.clinic_id,
                is_closed: false,
            },
        });

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
        await createNewPreferenceDefault(result.user_id);

        return {
            success: true,
            data: {
                user_uuid: result.user_uuid,
                veterinarian_uuid: veterinarian.vet_uuid,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getClinicVeterinarians = async (): Promise<
    ActionResponse<{ veterinarians: (veterinarians & { users: users | null })[] }>
> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");

        const clinic = await prisma.clinics.findFirst({
            where: { user_id: Number(session.user.id) },
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
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const getVeterinariansByClinic = async (
    clinicId: string,
): Promise<
    ActionResponse<{ veterinarians: { id: number; name: string; specialization: veterinary_specialization }[] }>
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

        return {
            success: true,
            data: {
                veterinarians: clinicVeterinarians.map((cv) => ({
                    id: cv.veterinarians.vet_id,
                    name: cv.veterinarians.users
                        ? `${cv.veterinarians.users.first_name} ${cv.veterinarians.users.last_name}`
                        : "Unknown",
                    specialization: cv.veterinarians.specialization,
                })),
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { newVeterinarian, getClinicVeterinarians, getVeterinariansByClinic };

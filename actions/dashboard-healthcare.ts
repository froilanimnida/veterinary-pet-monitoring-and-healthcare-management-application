"use server";

import { prisma } from "@/lib";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { type ActionResponse } from "@/types/server-action-response";
import {
    UpcomingVaccination,
    UpcomingVaccinationsResponse,
    UpcomingPrescription,
    UpcomingPrescriptionsResponse,
    DashboardHealthcareResponse,
} from "@/types/actions";

/**
 * Gets upcoming vaccinations for the logged-in user's pets
 * Used for the dashboard "At a Glance" section
 */
export async function getUpcomingVaccinations(limit = 5): Promise<ActionResponse<UpcomingVaccinationsResponse>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) redirect("/signin");

        // Get current date for comparison
        const today = new Date();

        // Get all active pets for the current user
        const userPets = await prisma.pets.findMany({
            where: {
                user_id: Number(session.user.id),
                deleted: false,
            },
            select: {
                pet_id: true,
                name: true,
                species: true,
                profile_picture_url: true,
            },
        });

        if (!userPets.length) {
            return { success: true, data: { vaccinations: [] } };
        }

        // Get pet IDs
        const petIds = userPets.map((pet) => pet.pet_id);

        // Get upcoming vaccinations for these pets
        const upcomingVaccinations = await prisma.vaccinations.findMany({
            where: {
                pet_id: {
                    in: petIds,
                },
                next_due_date: {
                    gte: today,
                },
            },
            orderBy: {
                next_due_date: "asc",
            },
            take: limit,
            include: {
                pets: {
                    select: {
                        name: true,
                        species: true,
                    },
                },
            },
        });
        if (!upcomingVaccinations.length) {
            return { success: true, data: { vaccinations: [] } };
        }

        return {
            success: true,
            data: {
                vaccinations: upcomingVaccinations as UpcomingVaccination[],
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch upcoming vaccinations",
        };
    }
}

/**
 * Gets upcoming prescription end dates or refills needed for the logged-in user's pets
 * Used for the dashboard "At a Glance" section
 */
export async function getUpcomingPrescriptions(limit = 5): Promise<ActionResponse<UpcomingPrescriptionsResponse>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) redirect("/signin");

        // Get current date for comparison
        const today = new Date();

        // Get all active pets for the current user
        const userPets = await prisma.pets.findMany({
            where: {
                user_id: Number(session.user.id),
                deleted: false,
            },
            select: {
                pet_id: true,
                name: true,
                species: true,
                profile_picture_url: true,
            },
        });

        if (!userPets.length) {
            return { success: true, data: { prescriptions: [] } };
        }

        // Get pet IDs
        const petIds = userPets.map((pet) => pet.pet_id);

        // Get upcoming prescription end dates or those with refills needed
        const upcomingPrescriptions = await prisma.prescriptions.findMany({
            where: {
                pet_id: {
                    in: petIds,
                },
                OR: [
                    {
                        end_date: {
                            gte: today,
                        },
                    },
                    {
                        refills_remaining: {
                            gt: 0,
                        },
                    },
                ],
            },
            orderBy: [
                {
                    end_date: "asc",
                },
                {
                    refills_remaining: "asc",
                },
            ],
            take: limit,
            include: {
                pets: {
                    select: {
                        name: true,
                        species: true,
                        profile_picture_url: true,
                    },
                },
                medications: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
            },
        });
        if (!upcomingPrescriptions.length) {
            return { success: true, data: { prescriptions: [] } };
        }

        return {
            success: true,
            data: {
                prescriptions: upcomingPrescriptions as UpcomingPrescription[],
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch upcoming prescriptions",
        };
    }
}

/**
 * Gets all upcoming healthcare events (vaccinations and prescriptions) for the user's dashboard
 * Used for the dashboard "At a Glance" section
 */
export async function getDashboardHealthcare(): Promise<ActionResponse<DashboardHealthcareResponse>> {
    try {
        const [vaccinationsResponse, prescriptionsResponse] = await Promise.all([
            getUpcomingVaccinations(5),
            getUpcomingPrescriptions(5),
        ]);

        if (!vaccinationsResponse.success || !prescriptionsResponse.success) {
            return {
                success: false,
                error: "Failed to fetch dashboard healthcare data",
            };
        }

        return {
            success: true,
            data: {
                vaccinations: vaccinationsResponse.data?.vaccinations || [],
                prescriptions: prescriptionsResponse.data?.prescriptions || [],
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch dashboard healthcare data",
        };
    }
}

/**
 * Fetches pet's dashboard healthcare data including upcoming vaccinations and prescriptions
 */
export async function getDashboardHealthcareData(petId?: number): Promise<
    ActionResponse<{
        vaccinations: UpcomingVaccination[];
        prescriptions: UpcomingPrescription[];
    }>
> {
    try {
        // Fetch upcoming vaccinations
        const vaccinations = await prisma.vaccinations.findMany({
            where: {
                pet_id: petId,
                next_due_date: {
                    gte: new Date(),
                },
            },
            include: {
                pets: {
                    select: {
                        name: true,
                        species: true,
                        breed: true,
                    },
                },
            },
            orderBy: {
                next_due_date: "asc",
            },
            take: 5,
        });

        // Fetch active prescriptions
        const prescriptions = await prisma.prescriptions.findMany({
            where: {
                pet_id: petId,
                end_date: {
                    gte: new Date(),
                },
            },
            include: {
                pets: {
                    select: {
                        name: true,
                        species: true,
                        breed: true,
                    },
                },
                medications: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
            },
            orderBy: {
                end_date: "asc",
            },
            take: 5,
        });

        return {
            success: true,
            data: {
                vaccinations: vaccinations.map((vax) => ({
                    vaccination_id: vax.vaccination_id,
                    pet_id: vax.pet_id,
                    appointment_id: null,
                    created_at: vax.created_at || new Date(),
                    vaccination_uuid: vax.vaccination_uuid || "",
                    vaccine_name: vax.vaccine_name || "Unknown Vaccine",
                    administered_date: vax.administered_date,
                    next_due_date: vax.next_due_date,
                    administered_by: vax.administered_by,
                    batch_number: vax.batch_number,
                    pets: vax.pets,
                })),
                prescriptions: prescriptions.map((rx) => ({
                    prescription_id: rx.prescription_id,
                    pet_id: rx.pet_id,
                    vet_id: rx.vet_id,
                    created_at: rx.created_at || new Date(),
                    prescription_uuid: rx.prescription_uuid || "",
                    medication_id: rx.medication_id,
                    medication_name: rx.medications?.name || "Unknown Medication",
                    medication_description: rx.medications?.description || "",
                    dosage: rx.dosage,
                    frequency: rx.frequency,
                    start_date: rx.start_date,
                    end_date: rx.end_date,
                    refills_remaining: rx.refills_remaining,
                    pets: rx.pets,
                    medications: rx.medications,
                    appointment_id: rx.appointment_id,
                })) as UpcomingPrescription[],
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Fetches pet's historical healthcare data including vaccinations, prescriptions, and procedures
 */
export async function getPetHistoricalHealthcareData(petId: number): Promise<
    ActionResponse<{
        vaccinations: {
            id: number;
            vaccine_name: string | null;
            administered_date: Date | null;
            batch_number: string | null;
        }[];
        prescriptions: {
            id: number;
            medication_name: string;
            dosage: string;
            frequency: string;
            start_date: Date | null;
            end_date: Date | null;
        }[];
        procedures: {
            id: number;
            procedure_type: string;
            procedure_date: Date | null;
            product_used: string | null;
            dosage: string | null;
            notes: string | null;
        }[];
    }>
> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) redirect("/signin");

        // Fetch vaccinations for the pet
        const vaccinations = await prisma.vaccinations.findMany({
            where: {
                pet_id: petId,
            },
            select: {
                vaccination_id: true,
                vaccine_name: true,
                administered_date: true,
                batch_number: true,
            },
            orderBy: {
                administered_date: "desc",
            },
        });

        // Fetch prescriptions for the pet
        const prescriptions = await prisma.prescriptions.findMany({
            where: {
                pet_id: petId,
            },
            select: {
                prescription_id: true,
                medications: {
                    select: {
                        name: true,
                    },
                },
                dosage: true,
                frequency: true,
                start_date: true,
                end_date: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });

        // Fetch healthcare procedures for the pet
        const procedures = await prisma.healthcare_procedures.findMany({
            where: {
                pet_id: petId,
            },
            select: {
                procedure_id: true,
                procedure_type: true,
                procedure_date: true,
                product_used: true,
                dosage: true,
                notes: true,
            },
            orderBy: {
                procedure_date: "desc",
            },
        });

        // Transform the data to the expected format
        return {
            success: true,
            data: {
                vaccinations: vaccinations.map((vax) => ({
                    id: vax.vaccination_id,
                    vaccine_name: vax.vaccine_name,
                    administered_date: vax.administered_date,
                    batch_number: vax.batch_number,
                })),
                prescriptions: prescriptions.map((rx) => ({
                    id: rx.prescription_id,
                    medication_name: rx.medications?.name || "Unknown Medication",
                    dosage: rx.dosage,
                    frequency: rx.frequency,
                    start_date: rx.start_date,
                    end_date: rx.end_date,
                })),
                procedures: procedures.map((proc) => ({
                    id: proc.procedure_id,
                    procedure_type: proc.procedure_type,
                    procedure_date: proc.procedure_date,
                    product_used: proc.product_used,
                    dosage: proc.dosage,
                    notes: proc.notes,
                })),
            },
        };
    } catch (error) {
        console.error("Error fetching pet healthcare data:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

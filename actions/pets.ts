"use server";
import { formatDecimal, prisma, toTitleCase } from "@/lib";
import { PetOnboardingSchema, UpdatePetSchema, type UpdatePetType, OnboardingPetSchema } from "@/schemas";
import { procedure_type, type breed_type, type pet_sex_type, type species_type } from "@prisma/client";
import { type ActionResponse } from "@/types/server-action-response";
import type { Pets } from "@/types/pets";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const addPet = async (values: PetOnboardingSchema): Promise<ActionResponse | void> => {
    try {
        const session = await getServerSession(authOptions);
        const newPetData = OnboardingPetSchema.safeParse(values);
        if (!newPetData.success) return { success: false, error: "Please check the form inputs" };

        if (!session || !session.user || !session.user.id) redirect("/signin");
        const pet = await prisma.pets.create({
            data: {
                name: newPetData.data.name,
                breed: newPetData.data.breed as breed_type,
                sex: newPetData.data.sex as pet_sex_type,
                species: newPetData.data.species as species_type,
                date_of_birth: newPetData.data.date_of_birth,
                weight_kg: newPetData.data.weight_kg,
                user_id: Number(session.user.id),
            },
        });

        if (!pet) throw await Promise.reject("Failed to add pet");

        if (newPetData.data.healthcare) {
            if (newPetData.data.healthcare.vaccinations?.length) {
                await prisma.vaccinations.createMany({
                    data: newPetData.data.healthcare.vaccinations.map((vac) => ({
                        pet_id: pet.pet_id,
                        vaccine_name: toTitleCase(vac.vaccine_name),
                        administered_date: vac.administered_date,
                        next_due_date: vac.next_due_date,
                        batch_number: vac.batch_number || undefined,
                    })),
                });
            }

            if (newPetData.data.healthcare.procedures?.length) {
                await prisma.healthcare_procedures.createMany({
                    data: newPetData.data.healthcare.procedures.map((proc) => ({
                        pet_id: pet.pet_id,
                        procedure_type: proc.procedure_type as procedure_type,
                        procedure_date: proc.procedure_date,
                        next_due_date: proc.next_due_date,
                        product_used: proc.product_used,
                        dosage: proc.dosage,
                        notes: proc.notes,
                    })),
                });
            }
        }
        revalidatePath("/user/pets");
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * Get a pet by its UUID
 */
function getPet(pet_uuid: string): Promise<ActionResponse<{ pet: Pets }>>;
/**
 * Get a pet by its ID
 */
function getPet(pet_id: number): Promise<ActionResponse<{ pet: Pets }>>;
/**
 * Implementation that handles both overloads
 */
async function getPet(identifier: string | number): Promise<ActionResponse<{ pet: Pets }>> {
    try {
        const where = typeof identifier === "string" ? { pet_uuid: identifier } : { pet_id: identifier };

        const pet = await prisma.pets.findUnique({
            where,
            include: {
                vaccinations: {
                    orderBy: {
                        administered_date: "desc",
                    },
                    include: {
                        veterinarians: {
                            include: {
                                users: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                medical_records: {
                    orderBy: {
                        visit_date: "desc",
                    },
                    include: {
                        veterinarians: {
                            include: {
                                users: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                healthcare_procedures: {
                    orderBy: {
                        procedure_date: "desc",
                    },
                    include: {
                        veterinarians: {
                            include: {
                                users: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                appointments: {
                    orderBy: {
                        appointment_date: "desc",
                    },
                    include: {
                        veterinarians: {
                            include: {
                                users: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                    },
                                },
                            },
                        },
                        clinics: true,
                    },
                },
                prescriptions: {
                    orderBy: {
                        created_at: "desc",
                    },
                    include: {
                        medications: true,
                        veterinarians: {
                            include: {
                                users: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                health_monitoring: {
                    orderBy: {
                        recorded_at: "desc",
                    },
                },
            },
        });

        if (!pet) return { success: false, error: "Pet not found" };

        const petInfo = {
            ...pet,
            weight_kg: formatDecimal(pet.weight_kg),
            health_monitoring: pet.health_monitoring.map((record) => ({
                ...record,
                weight_kg: formatDecimal(record.weight_kg),
                temperature_celsius: formatDecimal(record.temperature_celsius),
            })),
        };

        return { success: true, data: { pet: petInfo } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

const updatePet = async (values: UpdatePetType): Promise<ActionResponse | void> => {
    try {
        const petData = UpdatePetSchema.safeParse(values);
        if (!petData.success) return { success: false, error: "Please check the form inputs" };

        const pet = await prisma.pets.update({
            where: { pet_uuid: petData.data.pet_uuid },
            data: {
                name: petData.data.name,
                weight_kg: petData.data.weight_kg,
            },
        });
        if (!pet) return { success: false, error: "Failed to update pet" };
        revalidatePath(`/user/pets/${pet.pet_uuid}`);
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getPets = async (): Promise<ActionResponse<{ pets: Pets[] }>> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");
        const petsData = await prisma.pets.findMany({
            where: {
                user_id: Number(session.user.id),
                deleted: false,
            },
            orderBy: { created_at: "desc" },
            include: {
                vaccinations: {
                    where: {
                        next_due_date: {
                            gte: new Date(),
                        },
                    },
                    orderBy: {
                        next_due_date: "asc",
                    },
                    take: 5,
                },
                prescriptions: {
                    where: {
                        OR: [
                            {
                                end_date: {
                                    gte: new Date(),
                                },
                            },
                            {
                                refills_remaining: {
                                    gt: 0,
                                },
                            },
                        ],
                    },
                    orderBy: {
                        end_date: "asc",
                    },
                    include: {
                        medications: true,
                    },
                    take: 5,
                },
            },
        });

        if (!petsData || petsData.length === 0) return { success: true, data: { pets: [] } };

        const pets = petsData.map((pet) => ({
            ...pet,
            weight_kg: formatDecimal(pet.weight_kg),
        }));
        return { success: true, data: { pets } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const getPetId = async (pet_uuid: string): Promise<ActionResponse<{ pet_id: number }>> => {
    try {
        const pet = await prisma.pets.findUnique({
            where: { pet_uuid },
            select: { pet_id: true },
        });

        if (!pet) return { success: false, error: "Pet not found" };

        return { success: true, data: { pet_id: pet.pet_id } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

export { addPet, getPet, updatePet, getPets, getPetId };

"use server";
import { formatDecimal, getCurrentUtcDate, prisma, toTitleCase } from "@/lib";
import { PetOnboardingSchema, UpdatePetSchema, type UpdatePetType, OnboardingPetSchema } from "@/schemas";
import { type breed_type, type pet_sex_type, type pets, type species_type } from "@prisma/client";
import type { ActionResponse, Modify, Pets } from "@/types";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const addPet = async (values: PetOnboardingSchema): Promise<ActionResponse | void> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const newPetData = OnboardingPetSchema.safeParse(values);
        if (!newPetData.success) return { success: false, error: "Please check the form inputs" };

        const pet = await prisma.pets.create({
            data: {
                name: newPetData.data.name,
                breed: newPetData.data.breed as breed_type,
                sex: newPetData.data.sex as pet_sex_type,
                species: newPetData.data.species as species_type,
                date_of_birth: newPetData.data.date_of_birth,
                weight_kg: newPetData.data.weight_kg,
                user_id: Number(session.user.id),
                profile_picture_url: newPetData.data.profile_picture_url || null,
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
                        procedure_type: proc.procedure_type,
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
function getPet(pet_uuid: string): Promise<ActionResponse<{ pet: Modify<pets, { weight_kg: string }> }>>;
/**
 * Get a pet by its ID
 */
function getPet(pet_id: number): Promise<ActionResponse<{ pet: Modify<pets, { weight_kg: string }> }>>;
/**
 * Implementation that handles both overloads
 */
async function getPet(
    identifier: string | number,
): Promise<ActionResponse<{ pet: Modify<pets, { weight_kg: string }> }>> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const where = typeof identifier === "string" ? { pet_uuid: identifier } : { pet_id: identifier };
        const pet = await prisma.pets.findUnique({ where });
        if (!pet) return { success: false, error: "Pet not found" };
        const petInfo = { ...pet, weight_kg: formatDecimal(pet.weight_kg) };
        return { success: true, data: { pet: petInfo } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
}

const updatePet = async (values: UpdatePetType): Promise<ActionResponse | void> => {
    try {
        const petData = UpdatePetSchema.safeParse(values);
        if (!petData.success) return { success: false, error: "Please check the form inputs" };

        const updateData = {
            name: petData.data.name,
            weight_kg: petData.data.weight_kg,
            updated_at: getCurrentUtcDate(),
        };

        const pet = await prisma.pets.update({
            where: { pet_id: petData.data.pet_id },
            data: updateData,
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

const getUserPets = async (): Promise<ActionResponse<{ pets: Pets[] }>> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
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

/**
 * Get a list of pets for a specific user
 * @param user_id The ID of the user to get pets for (optional, defaults to the current session user)
 * @returns A promise that resolves to an ActionResponse containing the list of pets
 */
async function getPets(
    user_id?: number,
): Promise<ActionResponse<{ pets: Modify<pets, { weight_kg: string }>[] | [] }>> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const pets = await prisma.pets.findMany({
            where: {
                user_id: user_id ? user_id : Number(session.user.id),
                deleted: false,
            },
            orderBy: { created_at: "desc" },
        });
        const formattedPets = pets.map((p) => ({
            ...p,
            weight_kg: formatDecimal(p.weight_kg),
        }));
        return { success: true, data: { pets: formattedPets } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

const getUserPetsList = async (): Promise<ActionResponse<{ pets: Modify<pets, { weight_kg: string }>[] | [] }>> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const pets = await prisma.pets.findMany({
            where: {
                user_id: Number(session.user.id),
                deleted: false,
            },
            orderBy: { created_at: "desc" },
        });
        const formattedPets = pets.map((p) => ({
            ...p,
            weight_kg: formatDecimal(p.weight_kg),
        }));
        return {
            success: true,
            data: { pets: formattedPets },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
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

/**
 * Updates a pet's profile image information in the database
 * @param petId The ID of the pet to update
 * @param imageKey The key of the uploaded image in R2 storage (can be null to remove image)
 * @param imageUrl The presigned URL of the image (can be null to remove image)
 */
const updatePetProfileImage = async (
    petId: number,
    petUuid: string,
    imageKey: string | null,
    imageUrl: string | null,
): Promise<ActionResponse | void> => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) redirect("/signin");
    try {
        const pet = await prisma.pets.findFirst({
            where: {
                pet_id: petId,
                user_id: Number(session.user.id),
                deleted: false,
            },
        });

        if (!pet) return { success: false, error: "Pet not found or you don't have permission to modify it" };

        // Update the pet with the new profile image information
        console.log(imageKey, imageUrl);
        console.log("Length", imageKey?.length, imageUrl?.length);
        await prisma.pets.update({
            where: { pet_id: petId },
            data: {
                profile_picture_url: imageUrl,
                profile_picture_key: imageKey,
                updated_at: getCurrentUtcDate(),
            },
        });
        revalidatePath(`/user/pets/${petUuid}`);
        revalidatePath("/user/pets");
        return;
    } catch (error) {
        console.error("Error updating pet profile image:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const petsCount = async (user_id: number): Promise<number> => {
    const pets = await prisma.pets.count({
        where: {
            user_id: user_id,
            deleted: false,
        },
    });
    return pets;
};

export { addPet, getPet, updatePet, getUserPets, getUserPetsList, getPetId, updatePetProfileImage, petsCount, getPets };

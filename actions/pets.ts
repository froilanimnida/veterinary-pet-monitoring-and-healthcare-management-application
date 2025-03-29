"use server";
import { auth } from "@/auth";
import type { PetSchema } from "@/schemas/pet-definition";
import { type breed_type, type pet_sex_type, type pets, type species_type } from "@prisma/client";
import { z } from "zod";
import { getUserId } from "./user";
import { type ActionResponse } from "@/types/server-action-response";
import { prisma } from "@/lib/prisma";

const addPet = async (values: z.infer<typeof PetSchema>): Promise<ActionResponse<{ pet: pets }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw Promise.reject("User not found");
        }
        const user_id = await getUserId(session?.user?.email);
        const pet = await prisma.pets.create({
            data: {
                name: values.name,
                breed: values.breed as breed_type,
                sex: values.sex as pet_sex_type,
                species: values.species as species_type,
                date_of_birth: values.date_of_birth,
                weight_kg: values.weight_kg,
                medical_history: values.medical_history,
                vaccination_status: values.vaccination_status,
                user_id: user_id,
            },
        });
        if (!pet) {
            throw await Promise.reject("Failed to add pet");
        }
        return { success: true, data: { pet } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getPet = async (pet_uuid: string): Promise<ActionResponse<{ pet: pets }>> => {
    try {
        const pet = await prisma.pets.findUnique({
            where: {
                pet_uuid: pet_uuid,
            },
        });
        if (!pet) return { success: false, error: "Pet not found" };
        return { success: true, data: { pet: pet } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const updatePet = async (
    values: z.infer<typeof PetSchema>,
    pet_id: number,
): Promise<ActionResponse<{ pet_uuid: string }>> => {
    try {
        const pet = await prisma.pets.update({
            where: {
                pet_id: pet_id,
            },
            data: {
                name: values.name,
                breed: values.breed as breed_type,
                sex: values.sex as pet_sex_type,
                species: values.species as species_type,
                weight_kg: values.weight_kg,
                medical_history: values.medical_history,
                vaccination_status: values.vaccination_status,
            },
        });
        if (!pet) return { success: false, error: "Failed to update pet" };
        return { success: true, data: { pet_uuid: pet.pet_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const getPets = async (): Promise<ActionResponse<{ pets: pets[] }>> => {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            throw new Error("User not found");
        }
        const userId = await getUserId(session?.user?.email);
        const pets = await prisma.pets.findMany({
            where: {
                user_id: userId,
            },
        });
        if (!pets) {
            throw new Error("No pets found");
        }
        return { success: true, data: { pets } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { addPet, getPet, updatePet, getPets };

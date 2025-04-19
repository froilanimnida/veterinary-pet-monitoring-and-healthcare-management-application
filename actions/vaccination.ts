"use server";
import { prisma } from "@/lib";
import { type PetVaccinationType, PetVaccinationSchema } from "@/schemas";
import { ActionResponse } from "@/types/server-action-response";
import type { vaccinations } from "@prisma/client";
import { getPet } from "./pets";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * This function creates a new vaccination record in the database.
 * It first validates the input data, then checks if the pet exists.
 * If the pet exists, it creates a new vaccination record.
 * @param {PetVaccinationType} values - The vaccination data to be created.
 * @returns {Promise<ActionResponse | void>} - An object indicating success or failure.
 */
const createVaccination = async (values: PetVaccinationType): Promise<ActionResponse | void> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id || !session.user.role) redirect("/signin");
        const data = PetVaccinationSchema.safeParse(values);
        if (!data.success) return { success: false, error: "Please check the form inputs" };
        const pet = await prisma.pets.findFirst({
            where: { pet_uuid: data.data.pet_uuid },
        });
        let veterinarian_id = null;
        if (session.user.role === "veterinarian") {
            const veterinatian = await prisma.veterinarians.findFirst({
                where: { user_id: Number(session.user.id) },
                select: { vet_id: true },
            });
            veterinarian_id = veterinatian?.vet_id;
        }

        if (!pet) return { success: false, error: "Pet not found" };

        const result = await prisma.vaccinations.create({
            data: {
                vaccine_name: data.data.vaccine_name,
                administered_date: data.data.administered_date,
                next_due_date: data.data.next_due_date,
                batch_number: data.data.batch_number || undefined,
                pet_id: pet.pet_id,
                administered_by: veterinarian_id,
                appointment_id: data.data.appointment_id,
            },
        });

        if (!result) return { success: false, error: "Failed to add vaccination" };
        if (session.user.role === "veterinarian") {
            revalidatePath(`/vet/appointments/${values.appointment_uuid}`);
        }
        revalidatePath(`/user/pet/${values.pet_uuid}`);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * This function retrieves a specific vaccination record from the database.
 * It first checks if the vaccination exists, and if it does, it fetches it.
 * @param {string} vaccination_uuid - The UUID of the vaccination.
 * @returns {Promise<ActionResponse<{ vaccination: vaccinations }>>} - An object containing the vaccination or an error message.
 */
const getVaccination = async (vaccination_uuid: string): Promise<ActionResponse<{ vaccination: vaccinations }>> => {
    try {
        const vaccination = await prisma.vaccinations.findFirst({
            where: { vaccination_uuid: vaccination_uuid },
        });

        if (!vaccination) return { success: false, error: "Vaccination not found" };

        return { success: true, data: { vaccination } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * This function retrieves all vaccinations for a specific pet.
 * It first checks if the pet exists, and if it does, it fetches the vaccinations.
 * @param {string} pet_uuid - The UUID of the pet.
 * @returns {Promise<ActionResponse<{ vaccinations: vaccinations[] }>>} - An object containing the vaccinations or an error message.
 */
const getPetVaccinations = async (pet_uuid: string): Promise<ActionResponse<{ vaccinations: vaccinations[] }>> => {
    try {
        const pet = await getPet(pet_uuid);
        if (!pet || !pet.success || !pet.data?.pet) return { success: false, error: "Pet not found" };
        const vaccinations = await prisma.vaccinations.findMany({
            where: { pet_id: pet.data?.pet.pet_id },
        });
        return { success: true, data: { vaccinations } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

/**
 * This function deletes a vaccination record from the database. It only applies on appointment check-in.
 * It first checks if the vaccination exists, and if it does, it deletes it.
 * If the deletion is successful, it revalidates the path for the pet's page.
 * @param {number} vaccination_id - The id of the vaccination to delete.
 * @param {number} appointment_id - The id of the appointment.
 * @param {string} appointment_uuid - The uuid of the appointment.
 * @returns {Promise<ActionResponse>} - An object indicating success or failure.
 */
const deleteVaccination = async (
    vaccination_id: number,
    appointment_id: number,
    appointment_uuid: string,
    petUuid: string,
): Promise<ActionResponse | void> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");
        const vaccination = await prisma.vaccinations.findFirst({
            where: { vaccination_id: vaccination_id, appointment_id: appointment_id },
        });
        if (!vaccination) return { success: false, error: "Vaccination not found" };
        const result = await prisma.vaccinations.delete({
            where: { vaccination_uuid: vaccination.vaccination_uuid, appointment_id: appointment_id },
        });
        if (!result) return { success: false, error: "Failed to delete vaccination" };
        if (session.user.role === "veterinarian") {
            revalidatePath(`/vet/appointments/${appointment_uuid}`);
        }
        revalidatePath(`/user/pets/${petUuid}`);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};
export { createVaccination, getPetVaccinations, getVaccination, deleteVaccination };

"use server";
import { PrescriptionDefinition, type PrescriptionType } from "@/schemas";
import { prisma } from "@/lib";
import { ActionResponse } from "@/types/server-action-response";
import type { prescriptions } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const addPrescription = async (values: PrescriptionType): Promise<ActionResponse | void> => {
    try {
        const formData = PrescriptionDefinition.safeParse(values);
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");
        let veterinarian_id = null;
        if (session.user.role === "veterinarian") {
            const veterinatian = await prisma.veterinarians.findFirst({
                where: { user_id: Number(session.user.id) },
                select: { vet_id: true },
            });
            veterinarian_id = veterinatian?.vet_id;
        }
        if (!formData.success) {
            return {
                success: false,
                error: "Invalid prescription data",
            };
        }

        const result = await prisma.prescriptions.create({
            data: {
                dosage: formData.data.dosage,
                frequency: formData.data.frequency,
                start_date: formData.data.start_date,
                pet_id: Number(formData.data.pet_id),
                end_date: formData.data.end_date,
                refills_remaining: formData.data.refills_remaining,
                vet_id: veterinarian_id,
                appointment_id: formData.data.appointment_id,
                medication_id: formData.data.medication_id,
            },
        });
        if (!result) {
            return {
                success: false,
                error: "Failed to add prescription",
            };
        }
        revalidatePath(`/vet/`);
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const viewPrescription = async (
    prescription_uuid: string,
): Promise<ActionResponse<{ prescription: prescriptions }>> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");
        const prescription = await prisma.prescriptions.findUnique({
            where: {
                prescription_uuid: prescription_uuid,
            },
        });
        if (!prescription) {
            return {
                success: false,
                error: "Prescription not found",
            };
        }
        return {
            success: true,
            data: { prescription: prescription },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const deletePrescription = async (prescription_id: number, apppointment_uuid: string) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");
        const result = await prisma.prescriptions.delete({
            where: {
                prescription_id: prescription_id,
            },
        });
        if (!result) {
            return {
                success: false,
                error: "Failed to delete prescription",
            };
        }
        revalidatePath(`/vet/appointments/${apppointment_uuid}`);
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

export { addPrescription, viewPrescription, deletePrescription };

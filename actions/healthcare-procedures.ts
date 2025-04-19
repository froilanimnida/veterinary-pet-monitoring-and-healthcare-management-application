"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib";
import { type ProcedureType, ProcedureSchema } from "@/schemas";
import type { ActionResponse } from "@/types/server-action-response";
import type { healthcare_procedures, procedure_type } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const addHealthcareProcedure = async (values: ProcedureType | ProcedureType[]): Promise<ActionResponse | void> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id || !session.user.role) redirect("/signin");
        const proceduresArray = Array.isArray(values) ? values : [values];
        let veterinarian_id = undefined;

        if (session.user.role === "veterinarian") {
            const veterinarian = await prisma.veterinarians.findFirst({
                where: {
                    user_id: Number(session.user.id),
                },
            });
            veterinarian_id = veterinarian?.vet_id;
        }

        type ResultType = { success: false; error: string } | (healthcare_procedures & { success?: true });

        const results = await Promise.all(
            proceduresArray.map(async (procedure) => {
                const data = ProcedureSchema.safeParse(procedure);
                if (!data.success) return { success: false, error: "Please check the form inputs" } as ResultType;

                const pet = await prisma.pets.findFirst({
                    where: { pet_uuid: data.data.pet_uuid },
                });
                if (!pet)
                    return { success: false, error: `Pet with UUID ${data.data.pet_uuid} not found` } as ResultType;

                const result = await prisma.healthcare_procedures.create({
                    data: {
                        procedure_type: data.data.procedure_type as procedure_type,
                        procedure_date: data.data.procedure_date,
                        next_due_date: data.data.next_due_date,
                        product_used: data.data.product_used,
                        dosage: data.data.dosage,
                        notes: data.data.notes,
                        pet_id: pet.pet_id,
                        administered_by: veterinarian_id,
                        appointment_id: data.data.appointment_id,
                    },
                });
                return { ...result, success: true } as ResultType;
            }),
        );
        if (session.user.role === "veterinarian") {
            const appointmentUuid = Array.isArray(values) ? values[0].appointment_uuid : values.appointment_uuid;
            revalidatePath(`/vet/appointments/${appointmentUuid}`);
        }

        const failures = results.filter((result) => result.success === false);
        if (failures.length > 0) return { success: false, error: failures.map((f) => f.error).join("; ") };

        revalidatePath(`/user/pet/${Array.isArray(values) ? values[0].pet_uuid : values.pet_uuid}`);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const getHealthcareProcedures = async (
    pet_uuid: string,
): Promise<ActionResponse<{ procedures: healthcare_procedures[] }>> => {
    try {
        const pet = await prisma.pets.findFirst({
            where: {
                pet_uuid: pet_uuid,
            },
        });
        if (!pet) return { success: false, error: "Pet not found" };
        const procedures = await prisma.healthcare_procedures.findMany({
            where: { pet_id: pet.pet_id },
            orderBy: { procedure_date: "desc" },
        });
        if (!procedures) return { success: false, error: "Failed to get healthcare procedures" };
        return { success: true, data: { procedures: procedures } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const getHealthcareProcedure = async (
    procedure_uuid: string,
): Promise<ActionResponse<{ healthcare_procedure: healthcare_procedures }>> => {
    try {
        const procedure = await prisma.healthcare_procedures.findFirst({
            where: {
                procedure_uuid: procedure_uuid,
            },
        });
        if (!procedure) return { success: false, error: "Failed to get the healthcare procedure" };
        return { success: true, data: { healthcare_procedure: procedure } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

const deleteHealthcareProcedure = async (
    procedure_id: number,
    appointment_uuid: string,
    petUuid: string,
): Promise<ActionResponse | void> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) redirect("/signin");
        const procedure = await prisma.healthcare_procedures.delete({
            where: {
                procedure_id: procedure_id,
            },
        });
        if (!procedure) return { success: false, error: "Failed to delete the healthcare procedure" };
        if (session.user.role === "veterinarian") {
            revalidatePath(`/vet/appointments/${appointment_uuid}`);
        }
        revalidatePath(`/user/pet/${petUuid}`);
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

export { addHealthcareProcedure, getHealthcareProcedures, getHealthcareProcedure, deleteHealthcareProcedure };

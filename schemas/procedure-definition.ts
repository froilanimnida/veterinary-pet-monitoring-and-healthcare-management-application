import { z } from "zod";
import { procedure_type } from "@prisma/client";

export const ProcedureSchema = z.object({
    procedure_type: z.enum(Object.values(procedure_type) as [string, ...string[]]),
    procedure_date: z.date().optional(),
    next_due_date: z.date().optional(),
    product_used: z.string().max(100).optional(),
    dosage: z.string().max(50).optional(),
    notes: z.string().optional(),
    pet_uuid: z.string().uuid({
        message: "Invalid pet UUID",
    }),
    pet_id: z.number(),
    appointment_id: z.number().optional(),
    appointment_uuid: z
        .string()
        .uuid({
            message: "Invalid appointment UUID",
        })
        .optional(),
    external_provider: z.string().max(100).optional(),
    administered_by: z.number().optional(),
});

export const PetVaccinationSchema = z.object({
    pet_uuid: z.string().uuid({
        message: "Invalid pet UUID",
    }),
    pet_id: z.number(),
    vaccine_name: z.string().min(1).max(100),
    administered_date: z.date().optional(),
    next_due_date: z.date().optional(),
    batch_number: z.string().optional(),
    appointment_uuid: z
        .string()
        .uuid({
            message: "Invalid appointment UUID",
        })
        .optional(),
    appointment_id: z.number().optional(),
    external_provider: z.string().max(100).optional(),
});

export const PetHealthcareSchema = z.object({
    vaccinations: z.array(PetVaccinationSchema).optional(),
    procedures: z.array(ProcedureSchema).optional(),
});

export type ProcedureType = z.infer<typeof ProcedureSchema>;
export type PetHealthcareType = z.infer<typeof PetHealthcareSchema>;
export type PetVaccinationType = z.infer<typeof PetVaccinationSchema>;

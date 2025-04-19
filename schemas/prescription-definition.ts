import { z } from "zod";

export const PrescriptionDefinition = z.object({
    dosage: z.string(),
    frequency: z.string(),
    start_date: z.date(),
    end_date: z.date(),
    refills_remaining: z.number(),
    pet_uuid: z
        .string()
        .uuid({
            message: "Invalid pet UUID",
        })
        .optional(),
    pet_id: z.number(),
    appointment_id: z.number().optional(),
    vet_id: z.number().optional(),
    appointment_uuid: z.string().uuid().optional(),
    medication_id: z.number(),
});

export type PrescriptionType = z.infer<typeof PrescriptionDefinition>;

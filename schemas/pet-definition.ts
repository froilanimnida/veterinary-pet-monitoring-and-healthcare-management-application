import { z } from "zod";
import { breed_type, pet_sex_type, species_type } from "@prisma/client";
import { toTitleCase } from "@/lib";

export const PetSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(50)
        .transform((name) => toTitleCase(name.trim())),
    sex: z.enum(Object.values(pet_sex_type) as [string, ...string[]], {
        message: "Invalid sex type",
        required_error: "Sex is required",
        invalid_type_error: "Invalid sex type",
    }),
    species: z.enum(Object.values(species_type) as [string, ...string[]], {
        message: "Invalid species type",
        required_error: "Species is required",
        invalid_type_error: "Invalid species type",
    }),
    breed: z.enum(Object.values(breed_type) as [string, ...string[]], {
        message: "Invalid breed type",
        required_error: "Breed type is required",
        invalid_type_error: "Invalid breed type",
    }),
    date_of_birth: z.date().refine((date) => date <= new Date(), {
        message: "Date of birth must be in the past",
    }),
    weight_kg: z.number().refine((value) => value > 0, {
        message: "Weight must be a positive number",
    }),
    profile_picture_url: z.string().optional(),
    profile_picture_key: z.string().optional(),
});

export const UpdatePetSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(50)
        .transform((name) => toTitleCase(name.trim())),
    weight_kg: z
        .union([
            z.string().transform((val) => {
                const parsed = parseFloat(val);
                if (isNaN(parsed)) throw new Error("Weight must be a valid number");
                return parsed;
            }),
            z.number(),
        ])
        .refine((value) => value > 0, {
            message: "Weight must be a positive number",
        }),
    pet_id: z.number().int().positive({
        message: "Pet ID must be a positive integer",
    }),
    profile_picture_url: z.string().optional(),
});

export type PetType = z.infer<typeof PetSchema>;
export type UpdatePetType = z.infer<typeof UpdatePetSchema>;

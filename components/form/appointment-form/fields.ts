import { appointment_type, type clinics } from "@prisma/client";
import { toTitleCase } from "@/lib/functions/text/title-case";
import { TextFormField } from "@/types/forms/text-form-field";
import { SelectFormField } from "@/types/forms/select-form-field";
import type { Pets } from "@/types/pets";
import type { UseFormReturn } from "react-hook-form";
import type { AppointmentControlSchema } from "./form-control-type";

export function getAppointmentFields(): TextFormField[] {
    return [
        {
            label: "Notes",
            placeholder: "Notes",
            name: "notes",
            description: "The notes of the appointment.",
            required: true,
        },
    ];
}

export function getAppointmentSelectFields(
    params: {
        uuid: string;
        pets: Pets[];
        clinics: clinics[];
    },
    {
        veterinarians,
        isLoadingVets,
        handleClinicChange,
        handleVetChange,
        form,
    }: {
        veterinarians: { label: string; value: string }[];
        isLoadingVets: boolean;
        handleClinicChange: (value: string) => void;
        handleVetChange: (value: string) => void;

        form: UseFormReturn<AppointmentControlSchema>;
    },
): SelectFormField[] {
    return [
        {
            label: "Pet",
            placeholder: "Pet",
            name: "pet_uuid",
            description: "The pet of the appointment.",
            options: params.pets.map((pet) => ({
                label: `${pet.name} (${pet.species})`,
                value: pet.pet_uuid,
            })),
            defaultValue: "Buddy",
            onChange: (value) => form.setValue("pet_uuid", value),
            required: true,
        },
        {
            label: "Clinic",
            placeholder: "Select Clinic",
            name: "clinic_id",
            description: "The clinic of the appointment.",
            options: params.clinics.map((clinic) => ({
                label: clinic.name,
                value: String(clinic.clinic_id),
            })),
            onChange: handleClinicChange,
            required: true,
        },
        {
            label: "Veterinarian",
            placeholder: isLoadingVets ? "Loading veterinarians..." : "Select Veterinarian",
            name: "vet_id",
            description: "The veterinarian of the appointment.",
            options: veterinarians,
            onChange: handleVetChange,
            required: true,
        },
        {
            label: "Appointment Type",
            placeholder: "Appointment Type",
            name: "appointment_type",
            description: "The type of the appointment.",
            options: Object.values(appointment_type).map((type) => ({
                label: toTitleCase(type),
                value: type,
            })),
            defaultValue: appointment_type.behavioral_consultation,
            onChange: (value) => form.setValue("appointment_type", value),
            required: true,
        },
    ];
}

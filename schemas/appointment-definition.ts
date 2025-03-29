import { z } from "zod";
import { appointment_type } from "@prisma/client";

const appointmentDurationMap = {
    wellness_exam: 30,
    vaccination: 15,
    sick_visit: 30,
    follow_up: 20,
    surgery: 120,
    dental_cleaning: 60,
    emergency: 45,
    laboratory_work: 30,
    imaging: 30,
    grooming: 60,
    physical_therapy: 30,
    behavioral_consultation: 30,
    nutrition_consultation: 30,
    euthanasia: 30,
    new_pet_consultation: 30,
    senior_pet_care: 30,
    parasite_control: 30,
    microchipping: 30,
    medication_refill: 30,
    spay_neuter: 60,
    allergy_testing: 30,
    orthopedic_evaluation: 30,
    ophthalmology: 30,
    dermatology: 30,
    cardiology: 30,
    neurology: 30,
    oncology: 30,
    hospice_care: 30,
};

const appointment_type_array = Object.values(appointment_type) as [string, ...string[]];

export const AppointmentSchema = z.object({
    pet_uuid: z.string(),
    vet_id: z.string(),
    clinic_id: z.string(),
    appointment_date: z.date(),
    appointment_type: z.enum(appointment_type_array),
    notes: z.string(),
    appointment_time: z.string(),
    duration_minutes: z.number().default(30).optional(),
});

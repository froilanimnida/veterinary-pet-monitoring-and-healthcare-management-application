import { z } from 'zod';

export const AppointmentSchema = z.object({
	pet_id: z.string(),
	vet_id: z.string(),
	appointment_date: z.date(),
	appointment_type: z.string(),
	notes: z.string(),
	status: z.string(),
});

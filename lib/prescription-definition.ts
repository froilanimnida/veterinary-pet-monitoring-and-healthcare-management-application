import { z } from 'zod';

export const PrescriptionDefinition = z.object({
	dosage: z.string(),
	frequency: z.string(),
	start_date: z.date(),
	end_date: z.date(),
	refills_remaining: z.number(),
});

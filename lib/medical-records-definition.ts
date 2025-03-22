import { z } from 'zod';

export const MedicalRecordsDefinition = z.object({
	visit_date: z.date(),
	diagnosis: z.string(),
	treatment: z.string(),
	noted: z.string(),
});

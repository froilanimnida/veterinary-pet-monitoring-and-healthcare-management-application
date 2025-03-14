import { z } from 'zod';

export const ClinicSignUpSchema = z.object({
	name: z.string().nonempty(),
	address: z.string().nonempty(),
	city: z.string().nonempty(),
	state: z.string().nonempty(),
	postal_code: z.string().nonempty(),
	phone_number: z.string().nonempty(),
	emergency_services: z.string().nonempty(),
});

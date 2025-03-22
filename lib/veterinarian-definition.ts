import { z } from 'zod';
import { SignUpSchema } from './auth-definitions';

export const VeterinarianSchema = z.object({
	...SignUpSchema.shape,
	license_number: z
		.string()
		.nonempty({ message: 'License number is required.' }),
	specialization: z
		.string()
		.nonempty({ message: 'Specialization is required.' }),
});

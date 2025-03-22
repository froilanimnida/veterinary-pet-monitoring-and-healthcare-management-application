import { z } from 'zod';
import { SignUpSchema } from './auth-definitions';

export const BaseClinicSchema = z.object({
	name: z
		.string({ message: 'Name of the clinic is required' })
		.nonempty({ message: 'Name of the clinic is required' }),
	address: z
		.string({ message: 'Address is required' })
		.nonempty({ message: 'Address is required' }),
	city: z
		.string({ required_error: 'City is required' })
		.nonempty({ message: 'City is required' }),
	state: z
		.string({ required_error: 'State is required' })
		.nonempty({ message: 'State is required' }),
	postal_code: z
		.string({ required_error: 'Postal Code is required.' })
		.nonempty({ message: 'Postal Code is required.' }),
	phone_number: z.string().nonempty({ message: 'Phone number is required.' }),
	emergency_services: z.boolean({
		required_error: 'Emergency Services is required.',
	}),
});

export const NewClinicAccountSchema = z.object({
	...BaseClinicSchema.shape,
	...SignUpSchema.shape,
});

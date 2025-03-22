'use server';

import {
	UserRoleType,
	type VeterinarySpecialization,
} from '@/lib/types/constants';
import { VeterinarianSchema } from '@/lib/veterinarian-definition';
import { hashPassword } from '@/utils/security/password-check';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

export const newVeterinarian = async (
	values: z.infer<typeof VeterinarianSchema>,
) => {
	try {
		const formData = await VeterinarianSchema.parseAsync(values);
		const prisma = new PrismaClient();
		const user = await prisma.users.findFirst({
			where: {
				OR: [
					{ email: values.email },
					{ phone_number: values.phone_number },
				],
			},
		});
		if (user !== null) {
			return Promise.reject('User already exists');
		}
		const result = await prisma.users.create({
			data: {
				email: formData.email,
				password_hash: await hashPassword(formData.password),
				first_name: formData.first_name,
				last_name: formData.last_name,
				phone_number: formData.phone_number,
				role: UserRoleType.Veterinarian,
			},
		});
		if (result.user_id === null) {
			return Promise.reject('Failed to create account');
		}
		const veterinarian = await prisma.veterinarians.create({
			data: {
				license_number: formData.license_number,
				user_id: result.user_id,
				specialization:
					formData.specialization as VeterinarySpecialization,
			},
		});
		// const linkVet = await prisma.clinic_veterinarians.create({
		//     data: {
		//         clinic_id: formData.,
		//         veterinarian_id: veterinarian.vet_id
		//     }
		// })
		return Promise.resolve(result);
	} catch (error) {
		return Promise.reject(error);
	}
};

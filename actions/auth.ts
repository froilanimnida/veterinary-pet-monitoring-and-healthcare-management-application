'use server';
import { PrismaClient } from '@prisma/client';
import { SignUpSchema } from '@/lib/auth-definitions';
import type { z } from 'zod';
import { UserRoleType } from '@/lib/types/constants';
import { signOut } from 'next-auth/react';
import { NewClinicAccountSchema } from '@/lib/clinic-signup-definition';
import { hashPassword, verifyPassword } from '@/utils/security/password-check';

export const createAccount = async (values: z.infer<typeof SignUpSchema>) => {
	const formData = await SignUpSchema.parseAsync(values);
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
	const hashedPassword = await hashPassword(formData.password);
	const result = await prisma.users.create({
		data: {
			email: formData.email,
			password_hash: hashedPassword,
			first_name: formData.first_name,
			last_name: formData.last_name,
			phone_number: formData.phone_number,
			role: UserRoleType.User,
		},
	});
	if (result.user_id === null) {
		return Promise.reject('Failed to create account');
	}
	return Promise.resolve(result);
};

export const logout = async () => {
	const prisma = new PrismaClient();
	await prisma.$disconnect();
	signOut({ callbackUrl: '/auth/login' });
};

export const createClinicAccount = async (
	values: z.infer<typeof NewClinicAccountSchema>,
) => {
	try {
		const formData = await NewClinicAccountSchema.parseAsync(values);
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
			return Promise.reject('email_or_phone_number_already_exists');
		}
		const hashedPassword = await hashPassword(values.password);
		const result = await prisma.users.create({
			data: {
				email: formData.email,
				password_hash: hashedPassword,
				first_name: formData.first_name,
				last_name: formData.last_name,
				phone_number: formData.phone_number,
				role: UserRoleType.Client,
			},
		});
		if (result.user_id === null) {
			return Promise.reject('Failed to create account');
		}
		const clinicResult = await prisma.clinics.create({
			data: {
				name: formData.name,
				address: formData.address,
				city: formData.city,
				state: formData.state,
				postal_code: formData.postal_code,
				phone_number: formData.phone_number,
				emergency_services: formData.emergency_services,
				user_id: result.user_id,
			},
		});
		if (clinicResult.clinic_id === null) {
			return Promise.reject('Failed to create clinic account');
		}
		return { success: true };
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}
		if (typeof error === 'string') {
			throw new Error(error);
		}
		throw new Error('An unexpected error occurred');
	}
};

export const loginAccount = async (email: string, password: string) => {
	const prisma = new PrismaClient();
	const user = await prisma.users.findFirst({
		where: {
			email: email,
		},
	});
	if (user === null) {
		return Promise.reject('User not found');
	}
	if (!(await verifyPassword(password, user.password_hash))) {
		return Promise.reject('Invalid password');
	}
	return Promise.resolve(user);
};

// export const createVeterinarianAccount
// export const verifyEmail

import { z } from 'zod';

export const SignUpSchema = z.object({
	first_name: z.string().min(2).max(255),
	last_name: z.string().min(2).max(255),
	email: z.string().email(),
	password: z.string().min(8).max(255),
	confirm_password: z.string().min(8).max(255),
});

export const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(255),
});

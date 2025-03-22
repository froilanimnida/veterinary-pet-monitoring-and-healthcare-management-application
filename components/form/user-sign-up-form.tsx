'use client';
import React from 'react';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema } from '@/lib/auth-definitions';
import { z } from 'zod';
import { createAccount } from '@/actions/auth';
import toast from 'react-hot-toast';
import { redirect } from 'next/navigation';

function UserSignUpForm() {
	const signUpFormField: {
		label: string;
		placeholder: string;
		name:
			| 'first_name'
			| 'last_name'
			| 'email'
			| 'password'
			| 'confirm_password'
			| 'phone_number';
		description: string;
	}[] = [
		{
			label: 'First Name',
			placeholder: 'First Name',
			name: 'first_name',
			description: 'Your first name',
		},
		{
			label: 'Last Name',
			placeholder: 'Last Name',
			name: 'last_name',
			description: 'Your Last name',
		},
		{
			label: 'Email',
			placeholder: 'Email',
			name: 'email',
			description: 'Your valid email address',
		},
		{
			label: 'Phone Number',
			placeholder: 'Phone Number',
			name: 'phone_number',
			description: 'Your phone number',
		},
		{
			label: 'Password',
			placeholder: 'Password',
			name: 'password',
			description: 'Your password',
		},
		{
			label: 'Confirm your password',
			placeholder: 'Confirm Password',
			name: 'confirm_password',
			description: 'Retype your password',
		},
	];
	const signUpForm = useForm({
		defaultValues: {
			first_name: '',
			last_name: '',
			email: '',
			password: '',
			confirm_password: '',
			phone_number: '',
		},
		resolver: zodResolver(SignUpSchema),
		shouldFocusError: true,
		progressive: true,
		mode: 'onBlur',
	});

	const onSubmit = async (values: z.infer<typeof SignUpSchema>) => {
		const result = toast.promise(createAccount(values), {
			success: 'Account created successfully!',
			loading: 'Creating account...',
			error: (error) => {
				if (error === 'failed_to_create_user') {
					return 'Failed to create user';
				}
				if (error === 'user_already_exists') {
					return 'User already exists';
				}
				return 'Failed to create user';
			},
		});
		result.then(() => {
			redirect('/auth/login');
		});
	};
	return (
		<Form {...signUpForm}>
			<form
				onSubmit={signUpForm.handleSubmit(onSubmit)}
				className='space-y-8'>
				{signUpFormField.map((signUpFormField) => (
					<FormField
						key={signUpFormField.name}
						control={signUpForm.control}
						name={signUpFormField.name}
						render={({ field, fieldState }) => (
							<FormControl>
								<FormItem>
									<FormLabel>
										{signUpFormField.label}
									</FormLabel>
									<Input
										type={
											(
												signUpFormField.name ===
													'password' ||
												signUpFormField.name ===
													'confirm_password'
											) ?
												'password'
											:	'text'
										}
										placeholder={
											signUpFormField.placeholder
										}
										{...field}
									/>
									<FormDescription>
										{signUpFormField.description}
									</FormDescription>
									<FormMessage className='text-red-500'>
										{fieldState.error?.message}
									</FormMessage>
								</FormItem>
							</FormControl>
						)}
					/>
				))}
				<Button className='w-full'>Create account</Button>
			</form>
		</Form>
	);
}

export default UserSignUpForm;

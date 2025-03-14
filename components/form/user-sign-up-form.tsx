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
import { CardContent } from '@/components/ui/card';
import { z } from 'zod';

function UserSignUpForm() {
	const signUpFormField = [
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
		},
		resolver: zodResolver(SignUpSchema),
	});

	const onSubmit = (values: z.infer<typeof SignUpSchema>) => {
		console.log(values);
	};
	return (
		<CardContent className='space-y-6'>
			<form onSubmit={signUpForm.handleSubmit(onSubmit)}>
				<Form {...signUpForm}>
					{signUpFormField.map((field, index) => (
						<FormControl key={index}>
							<FormItem>
								<FormLabel>{field.label}</FormLabel>
								<FormField
									control={signUpForm.control}
									name={
										field.name as
											| 'first_name'
											| 'last_name'
											| 'email'
											| 'password'
											| 'confirm_password'
									}
									render={({ field }) => (
										<Input
											type={
												field.name === 'password' ||
												field.name ===
													'confirm_password'
													? 'password'
													: 'text'
											}
											placeholder={
												signUpFormField[index]
													.placeholder
											}
											className='mb-4'
											{...field}
										/>
									)}
								/>
								<FormDescription>
									{field.description}
								</FormDescription>
								<FormMessage />
							</FormItem>
						</FormControl>
					))}
					<Button className='w-full'>Create account</Button>
				</Form>
				<Button type='submit'>Sign Up</Button>
			</form>
		</CardContent>
	);
}

export default UserSignUpForm;

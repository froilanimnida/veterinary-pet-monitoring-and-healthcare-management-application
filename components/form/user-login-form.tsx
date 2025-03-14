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
import { CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
// import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@/lib/auth-definitions';
import { z } from 'zod';

function UserLoginForm() {
	const loginFormFields = [
		{
			label: 'Email',
			placeholder: 'Email',
			name: 'email',
			description: 'The email you use when you register an account.',
		},
		{
			label: 'Password',
			placeholder: 'Password',
			name: 'password',
			description: 'The password you use when you register an account.',
		},
	];
	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
		},
		progressive: true,
		resolver: zodResolver(LoginSchema),
	});

	const onSubmit = (values: z.infer<typeof LoginSchema>) => {
		console.log(values);
	};
	return (
		<CardContent className='space-y-8'>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-8'>
				<Form {...form}>
					{loginFormFields.map((field, index) => (
						<FormControl key={index}>
							<FormItem>
								<FormLabel>{field.label}</FormLabel>
								<FormField
									control={form.control}
									name={field.name as 'email' | 'password'}
									render={({ field }) => (
										<Input
											type='text'
											placeholder={
												loginFormFields[index]
													.placeholder
											}
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
					<Button
						className='w-full'
						type='submit'>
						Login
					</Button>
				</Form>
			</form>
		</CardContent>
	);
}

export default UserLoginForm;

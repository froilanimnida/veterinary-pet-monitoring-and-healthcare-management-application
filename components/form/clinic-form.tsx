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
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ClinicSignUpSchema } from '@/lib/clinic-signup-definition';

function ClinicSignUp() {
	const formFieldsArray = [
		{
			label: 'Clinic Name',
			placeholder: 'Clinic Name',
			name: 'name',
			description: 'The name of your clinic.',
		},
		{
			label: 'Address',
			placeholder: 'Address',
			name: 'address',
			description: 'The address of your clinic.',
		},
		{
			label: 'City',
			placeholder: 'City',
			name: 'city',
			description: 'The city where your clinic is located.',
		},
		{
			label: 'State',
			placeholder: 'State',
			name: 'state',
			description: 'The state where your clinic is located.',
		},
		{
			label: 'Postal Code',
			placeholder: 'Postal Code',
			name: 'postal_code',
			description: 'The postal code of your clinic.',
		},
		{
			label: 'Phone Number',
			placeholder: 'Phone Number',
			name: 'phone_number',
			description: 'The phone number of your clinic.',
		},
		{
			label: 'Emergency Services',
			placeholder: 'Emergency Services',
			name: 'emergency_services',
			description: 'The emergency services your clinic provides.',
		},
	];
	const clinicSignUpForm = useForm({
		defaultValues: {
			name: '',
			address: '',
			city: '',
			state: '',
			postal_code: '',
			phone_number: '',
			emergency_services: '',
		},
		resolver: zodResolver(ClinicSignUpSchema),
		progressive: true,
	});
	const onSubmit = (values: z.infer<typeof ClinicSignUpSchema>) => {
		console.log(values);
	};
	return (
		<CardContent className='space-y-8'>
			<form onSubmit={clinicSignUpForm.handleSubmit(onSubmit)}>
				<Form {...clinicSignUpForm}>
					{formFieldsArray.map((field, index) => (
						<FormControl key={index}>
							<FormItem className='mb-5'>
								<FormLabel>{field.label}</FormLabel>
								<FormField
									control={clinicSignUpForm.control}
									name={
										field.name as
											| 'name'
											| 'address'
											| 'city'
											| 'state'
											| 'postal_code'
											| 'phone_number'
											| 'emergency_services'
									}
									render={({ field }) => (
										<Input
											type='text'
											placeholder={
												formFieldsArray[index]
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
				</Form>
				<Button type='submit'>Sign Up</Button>
			</form>
		</CardContent>
	);
}

export default ClinicSignUp;

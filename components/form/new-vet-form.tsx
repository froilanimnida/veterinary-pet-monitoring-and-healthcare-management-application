'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VeterinarianSchema } from '@/lib/veterinarian-definition';
import React from 'react';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectValue,
	SelectTrigger,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
	FormControl,
	Form,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { VeterinarySpecialization } from '@/lib/types/constants';

const NewVeterinaryForm = () => {
	const newVetFields: {
		label: string;
		placeholder: string;
		name:
			| 'first_name'
			| 'last_name'
			| 'email'
			| 'phone_number'
			| 'password'
			| 'confirm_password'
			| 'license_number'
			| 'specialization';
		description: string;
	}[] = [
		{
			label: 'First Name',
			placeholder: 'First Name',
			name: 'first_name',
			description: 'The first name of the veterinarian.',
		},
		{
			label: 'Last Name',
			placeholder: 'Last Name',
			name: 'last_name',
			description: 'The last name of the veterinarian.',
		},
		{
			label: 'Email',
			placeholder: 'Email',
			name: 'email',
			description: 'The email of the veterinarian.',
		},
		{
			label: 'Phone Number',
			placeholder: 'Phone Number',
			name: 'phone_number',
			description: 'The phone number of the veterinarian.',
		},
		{
			label: 'Password',
			placeholder: 'Password',
			name: 'password',
			description: 'The password of the veterinarian.',
		},
		{
			label: 'Confirm Password',
			placeholder: 'Confirm Password',
			name: 'confirm_password',
			description: 'Confirm the password of the veterinarian.',
		},
		{
			label: 'License Number',
			placeholder: 'License Number',
			name: 'license_number',
			description: 'The license number of the veterinarian.',
		},
	];
	const specializationOptions = Object.values(VeterinarySpecialization);
	const newVeterinaryForm = useForm({
		resolver: zodResolver(VeterinarianSchema),
		mode: 'onBlur',
		progressive: true,
		shouldFocusError: true,
		defaultValues: {
			first_name: '',
			last_name: '',
			email: '',
			phone_number: '',
			password: '',
			confirm_password: '',
			license_number: '',
			specialization: '',
		},
	});

	const onSubmit = (values: z.infer<typeof VeterinarianSchema>) => {
		console.log('Values: ', values);
	};
	return (
		<Form {...newVeterinaryForm}>
			<form
				onSubmit={newVeterinaryForm.handleSubmit(onSubmit)}
				className='space-y-8'>
				{newVetFields.map((newVetField) => (
					<FormField
						control={newVeterinaryForm.control}
						key={newVetField.name}
						name={newVetField.name}
						render={({ field, fieldState }) => {
							return (
								<FormItem>
									<FormLabel>{newVetField.label}</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder={
												newVetField.placeholder
											}
											name={newVetField.name}
										/>
									</FormControl>
									<FormDescription>
										{newVetField.description}
									</FormDescription>
									<FormMessage className='text-red-500'>
										{fieldState.error?.message}
									</FormMessage>
								</FormItem>
							);
						}}
					/>
				))}
				<FormField
					name='specialization'
					render={({ field, fieldState }) => {
						return (
							<FormItem>
								<FormLabel>Specialization</FormLabel>
								<FormControl>
									<Select
										defaultValue={field.value}
										onValueChange={(value) => {
											field.onChange(value);
										}}>
										<SelectTrigger>
											<SelectValue>
												{field.value
													.toString()
													.toUpperCase() ||
													'Select a specialization'}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>
													Specialization
												</SelectLabel>
												{specializationOptions.map(
													(option) => (
														<SelectItem
															key={option}
															value={option}>
															{option
																.replaceAll(
																	'_',
																	' ',
																)
																.toUpperCase()}
														</SelectItem>
													),
												)}
											</SelectGroup>
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage>
									{fieldState.error?.message}
								</FormMessage>
							</FormItem>
						);
					}}
				/>
				<Button type='submit'>Submit</Button>
			</form>
		</Form>
	);
};

export default NewVeterinaryForm;

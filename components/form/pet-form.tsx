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
import { PetSchema } from '@/lib/pet-definition';
import { CardContent } from '@/components/ui/card';
import { z } from 'zod';

function PetForm() {
	const petsFormFields = [
		{
			label: 'Pet Name',
			placeholder: 'Pet Name',
			name: 'name',
			description: 'The name of your pet.',
		},
		{
			label: 'Pet Type',
			placeholder: 'Pet Type',
			name: 'type',
			description: 'The type of your pet.',
		},
		{
			label: 'Pet Breed',
			placeholder: 'Pet Breed',
			name: 'breed',
			description: 'The breed of your pet.',
		},
		{
			label: 'Pet Weight',
			placeholder: 'Pet Weight (kg)',
			name: 'weight',
			description: 'The weight of your pet.',
		},
		{
			label: "Pet's Medical History",
			placeholder: "Pet's Medical History",
			name: 'medical_history',
			description: 'The medical history of your pet.',
		},
		{
			label: "Pet's Vaccination Status",
			placeholder: "Pet's Vaccination Status",
			name: 'vaccination_status',
			description: 'The vaccination status of your pet.',
		},
	];
	const petForm = useForm({
		defaultValues: {
			name: '',
			species: '',
			breed: '',
			weight_kg: 0,
			medical_history: '',
			vaccination_status: '',
		},
		resolver: zodResolver(PetSchema),
	});
	const onSubmit = (values: z.infer<typeof PetSchema>) => {
		console.log(values);
	};
	return (
		<CardContent className='space-y-8'>
			<form onSubmit={petForm.handleSubmit(onSubmit)}>
				<Form {...petForm}>
					{petsFormFields.map((field, index) => (
						<FormControl>
							<FormItem key={field.name}>
								<FormLabel>{field.label}</FormLabel>
								<FormField
									name={
										field.name as
											| 'name'
											| 'type'
											| 'breed'
											| 'weight_kg'
											| 'medical_history'
											| 'vaccination_status'
									}
									control={petForm.control}
									render={({ field }) => (
										<Input
											type='text'
											placeholder={
												petsFormFields[index]
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
				<Button type='submit'>Submit</Button>
			</form>
		</CardContent>
	);
}

export default PetForm;

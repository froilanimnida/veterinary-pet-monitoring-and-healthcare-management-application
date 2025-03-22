'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React from 'react';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
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
import { AppointmentType } from '@/lib/types/constants';
import { AppointmentSchema } from '@/lib/appointment-definition';
import { cn } from '@/lib/utils';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const AppointmentForm = () => {
	const newAppointmentFields: {
		label: string;
		placeholder: string;
		name: 'status' | 'notes';
		description: string;
	}[] = [
		{
			label: 'Status',
			placeholder: 'Status',
			name: 'status',
			description: 'The status of the appointment.',
		},
		{
			label: 'Notes',
			placeholder: 'Notes',
			name: 'notes',
			description: 'The notes of the appointment.',
		},
	];
	const newAppointmentSelectFields: {
		label: string;
		placeholder: string;
		name: 'appointment_type' | 'vet_id' | 'pet_id';
		description: string;
		options: string[];
		defaultValue?: string;
		onChange?: (value: string) => void;
	}[] = [
		{
			label: 'Appointment Type',
			placeholder: 'Appointment Type',
			name: 'appointment_type',
			description: 'The type of the appointment.',
			options: Object.values(AppointmentType),
			defaultValue: AppointmentType.BehavioralConsultation,
			onChange: (value) =>
				newAppointmentForm.setValue('appointment_type', value),
		},
		{
			label: 'Veterinarian',
			placeholder: 'Veterinarian',
			name: 'vet_id',
			description: 'The veterinarian of the appointment.',
			options: ['John Doe', 'Jane Doe'],
			defaultValue: 'John Doe',
			onChange: (value) => newAppointmentForm.setValue('vet_id', value),
		},
		{
			label: 'Pet',
			placeholder: 'Pet',
			name: 'pet_id',
			description: 'The pet of the appointment.',
			options: ['Buddy', 'Milo', 'Charlie', 'Max'],
			defaultValue: 'Buddy',
			onChange: (value) => newAppointmentForm.setValue('pet_id', value),
		},
	];
	const newAppointmentForm = useForm({
		defaultValues: {
			status: '',
			notes: '',
			appointment_type: '',
			vet_id: '',
			pet_id: '',
		},
		resolver: zodResolver(AppointmentSchema),
		progressive: true,
		shouldFocusError: true,
	});
	const onSubmit = (values: z.infer<typeof AppointmentSchema>) => {
		console.log(values);
	};
	return (
		<Form {...newAppointmentForm}>
			<form
				onSubmit={newAppointmentForm.handleSubmit(onSubmit)}
				className='space-y-8'>
				<FormField
					name='appointment_date'
					control={newAppointmentForm.control}
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Date of Birth</FormLabel>
							<FormControl>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant='outline'
											className={cn(
												'w-full justify-start text-left font-normal',
												!field.value &&
													'text-muted-foreground',
											)}>
											<CalendarIcon className='mr-2 h-4 w-4' />
											{field.value ?
												format(
													field.value,
													'MM/dd/yyyy',
												)
											:	<span>Pick a date</span>}
										</Button>
									</PopoverTrigger>
									<PopoverContent className='w-auto p-0'>
										<Calendar
											mode='single'
											selected={field.value}
											onSelect={(date) => {
												if (!date) {
													field.onChange(null);
													return;
												}

												const dateOnly = new Date(
													date.getFullYear(),
													date.getMonth(),
													date.getDate(),
												);

												field.onChange(dateOnly);
											}}
											initialFocus
											disabled={(date) =>
												date < new Date()
											}
											className='bg-white'
										/>
									</PopoverContent>
								</Popover>
							</FormControl>
							<FormDescription>
								Enter the date of the appointment.
							</FormDescription>
							<FormMessage>
								{fieldState.error?.message}
							</FormMessage>
						</FormItem>
					)}
				/>
				{newAppointmentFields.map((newAppointmentField) => {
					return (
						<FormField
							key={newAppointmentField.name}
							control={newAppointmentForm.control}
							name={newAppointmentField.name}
							render={({ field, fieldState }) => {
								return (
									<FormItem>
										<FormLabel>
											{newAppointmentField.label}
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type='text'
												placeholder={
													newAppointmentField.placeholder
												}
											/>
										</FormControl>
										<FormDescription>
											{newAppointmentField.description}
										</FormDescription>
										<FormMessage className='text-red-500'>
											{fieldState.error?.message}
										</FormMessage>
									</FormItem>
								);
							}}
						/>
					);
				})}
				{newAppointmentSelectFields.map((newAppointmentSelectField) => (
					<FormField
						key={newAppointmentSelectField.name}
						control={newAppointmentForm.control}
						name={newAppointmentSelectField.name}
						render={({ field, fieldState }) => {
							return (
								<FormItem>
									<FormLabel>
										{newAppointmentSelectField.label}
									</FormLabel>
									<Select
										onValueChange={(value) => {
											field.onChange(value);
											if (
												newAppointmentSelectField.onChange
											)
												newAppointmentSelectField.onChange(
													value,
												);
										}}
										value={field.value}
										defaultValue={
											field.value ||
											newAppointmentSelectField.defaultValue
										}>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={
														field.value
															.toString()
															.toUpperCase() ||
														'Select an option'
													}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{newAppointmentSelectField.options.map(
												(option) => {
													return (
														<SelectItem
															key={option}
															value={option}>
															{option}
														</SelectItem>
													);
												},
											)}
										</SelectContent>
									</Select>
									<FormDescription>
										{newAppointmentSelectField.description}
									</FormDescription>
									<FormMessage>
										{fieldState.error?.message}
									</FormMessage>
								</FormItem>
							);
						}}
					/>
				))}
				<Button type='submit'>Add Appointment</Button>
			</form>
		</Form>
	);
};

export default AppointmentForm;

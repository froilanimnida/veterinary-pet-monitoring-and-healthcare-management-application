import React, { Suspense } from 'react';
import { VeterinarySpecialization } from '@/lib/types/constants';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import NewVeterinaryForm from '@/components/form/new-vet-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'PawsitiveHealth | Veterinaries',
	description: 'PawsitiveHealth is a pet health care service.',
};

const Veterinaries = () => {
	const veterinariesSample: {
		first_name: string;
		last_name: string;
		license_number: string;
		specialization: VeterinarySpecialization;
	}[] = [
		{
			first_name: 'John',
			last_name: 'Doe',
			license_number: '123456',
			specialization: VeterinarySpecialization.Behaviorist,
		},
		{
			first_name: 'Jane',
			last_name: 'Doe',
			license_number: '654321',
			specialization: VeterinarySpecialization.Dentist,
		},
		{
			first_name: 'John',
			last_name: 'Doe',
			license_number: '123456',
			specialization: VeterinarySpecialization.Dermatologist,
		},
		{
			first_name: 'Jane',
			last_name: 'Doe',
			license_number: '654321',
			specialization: VeterinarySpecialization.Dentist,
		},
		{
			first_name: 'John',
			last_name: 'Doe',
			license_number: '123456',
			specialization: VeterinarySpecialization.EmergencyAndCriticalCare,
		},
		{
			first_name: 'Jane',
			last_name: 'Doe',
			license_number: '654321',
			specialization: VeterinarySpecialization.Dentist,
		},
		{
			first_name: 'John',
			last_name: 'Doe',
			license_number: '123456',
			specialization: VeterinarySpecialization.Orthopedic,
		},
		{
			first_name: 'Jane',
			last_name: 'Doe',
			license_number: '654321',
			specialization: VeterinarySpecialization.Dentist,
		},
		{
			first_name: 'John',
			last_name: 'Doe',
			license_number: '123456',
			specialization: VeterinarySpecialization.GeneralPractitioner,
		},
		{
			first_name: 'Jane',
			last_name: 'Doe',
			license_number: '654321',
			specialization: VeterinarySpecialization.Dentist,
		},
		{
			first_name: 'John',
			last_name: 'Doe',
			license_number: '123456',
			specialization: VeterinarySpecialization.Ophthalmologist,
		},
		{
			first_name: 'Jane',
			last_name: 'Doe',
			license_number: '654321',
			specialization: VeterinarySpecialization.Dentist,
		},
	];
	return (
		<div className='grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4'>
			{veterinariesSample.map((veterinary, index) => (
				<Card key={index}>
					<CardHeader>
						<CardTitle>
							{veterinary.first_name} {veterinary.last_name}
						</CardTitle>
						<CardDescription>
							{veterinary.specialization}
						</CardDescription>
					</CardHeader>
					<CardContent>{veterinary.license_number}</CardContent>
					<CardFooter>
						<Button>Manage</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
};

const Veterinary = () => {
	return (
		<section className='p-4 w-full'>
			<Suspense fallback={<SkeletonCard />}>
				<Veterinaries />
			</Suspense>
			<Dialog>
				<DialogTrigger asChild>
					<Button>Add Veterinary</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Veterinary</DialogTitle>
						<DialogDescription>
							Please provide the details of the new veterinary you
							want to add.
						</DialogDescription>
					</DialogHeader>
					<NewVeterinaryForm />
				</DialogContent>
			</Dialog>
		</section>
	);
};

export default Veterinary;

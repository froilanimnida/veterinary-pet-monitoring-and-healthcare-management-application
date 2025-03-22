import { AppointmentType } from '@/lib/types/constants';
import React, { Suspense } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import AppointmentForm from '@/components/form/appointment-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'PawsitiveHealth | Appointments',
	description: 'PawsitiveHealth is a pet health care service.',
};

const AppointmentsHistory = () => {
	const sampleAppointments: {
		pet_name: string;
		vet_name: string;
		appointment_date: string;
		appointment_type: AppointmentType;
		status: string;
		notes: string;
	}[] = [
		{
			pet_name: 'Buddy',
			vet_name: 'John Doe',
			appointment_date: '2021-08-01',
			appointment_type: AppointmentType.BehavioralConsultation,
			status: 'Completed',
			notes: 'Buddy is doing well',
		},
		{
			pet_name: 'Milo',
			vet_name: 'Jane Doe',
			appointment_date: '2021-08-02',
			appointment_type: AppointmentType.Vaccination,
			status: 'Completed',
			notes: 'Milo is healthy',
		},
		{
			pet_name: 'Charlie',
			vet_name: 'John Doe',
			appointment_date: '2021-08-03',
			appointment_type: AppointmentType.Euthanasia,
			status: 'Completed',
			notes: 'Charlie is doing well',
		},
		{
			pet_name: 'Max',
			vet_name: 'Jane Doe',
			appointment_date: '2021-08-04',
			appointment_type: AppointmentType.Vaccination,
			status: 'Completed',
			notes: 'Max is healthy',
		},
		{
			pet_name: 'Max',
			vet_name: 'John Doe',
			appointment_date: '2021-08-05',
			appointment_type: AppointmentType.SeniorPetCare,
			status: 'Completed',
			notes: 'Max is doing well',
		},
		{
			pet_name: 'Max',
			vet_name: 'Jane Doe',
			appointment_date: '2021-08-06',
			appointment_type: AppointmentType.LaboratoryWork,
			status: 'Completed',
			notes: 'Max is healthy',
		},
		{
			pet_name: 'Max',
			vet_name: 'John Doe',
			appointment_date: '2021-08-07',
			appointment_type: AppointmentType.ParasiteControl,
			status: 'Completed',
			notes: 'Max is doing well',
		},
	];

	return (
		<div className='grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4'>
			{sampleAppointments.map((appointment, index) => (
				<Card key={index}>
					<CardHeader>
						<CardTitle>{appointment.pet_name}</CardTitle>
						<CardDescription>
							{appointment.vet_name}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='flex flex-col space-y-2'>
							<div>
								<span className='font-semibold'>Date:</span>{' '}
								{appointment.appointment_date}
							</div>
							<div>
								<span className='font-semibold'>Type:</span>{' '}
								{appointment.appointment_type}
							</div>
							<div>
								<span className='font-semibold'>Status:</span>{' '}
								{appointment.status}
							</div>
							<div>
								<span className='font-semibold'>Notes:</span>{' '}
								{appointment.notes}
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button>Manage</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
};

function Appointments() {
	return (
		<section className='p-4 w-full'>
			<Suspense fallback={<SkeletonCard />}>
				<AppointmentsHistory />
			</Suspense>
			<Dialog>
				<DialogTrigger asChild>
					<Button>New Appointment</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Appointment</DialogTitle>
						<DialogDescription>
							Add new clinic appointment, select a pet and a
							veterinarian and other details.
						</DialogDescription>
					</DialogHeader>
					<AppointmentForm />
				</DialogContent>
			</Dialog>
		</section>
	);
}

export default Appointments;

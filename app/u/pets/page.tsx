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
import { SkeletonCard } from '@/components/ui/skeleton-card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import AddPetForm from '@/components/form/pet-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'PawsitiveHealth | User Pets',
	description: 'PawsitiveHealth is a pet health care service.',
};

const PetList = () => {
	const pets = [
		{
			name: 'Buddy',
			breed: 'Golden Retriever',
			age: 3,
			image: '/images/buddy.jpg',
		},
		{
			name: 'Milo',
			breed: 'Beagle',
			age: 2,
			image: '/images/milo.jpg',
		},
		{
			name: 'Charlie',
			breed: 'Poodle',
			age: 4,
			image: '/images/charlie.jpg',
		},
		{
			name: 'Max',
			breed: 'Labrador',
			age: 1,
			image: '/images/max.jpg',
		},
		{
			name: 'Max',
			breed: 'Labrador',
			age: 1,
			image: '/images/max.jpg',
		},
		{
			name: 'Max',
			breed: 'Labrador',
			age: 1,
			image: '/images/max.jpg',
		},
		{
			name: 'Max',
			breed: 'Labrador',
			age: 1,
			image: '/images/max.jpg',
		},
	];

	return (
		<div className='grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4'>
			{pets.map((pet, index) => (
				<Card key={index}>
					<CardHeader>
						<CardTitle>{pet.name}</CardTitle>
						<CardDescription>{pet.breed}</CardDescription>
					</CardHeader>
					<CardContent></CardContent>
					<CardFooter>
						<Button>Manage</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
};

function PetsPage() {
	return (
		<section className='p-4 w-full'>
			<Suspense fallback={<SkeletonCard />}>
				<PetList />
			</Suspense>
			<Dialog>
				<DialogTrigger asChild>
					<Button>Add Pet</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add a new pet to your account</DialogTitle>
						<DialogDescription>
							Please provide the details of your pet to add it to
							your account.
						</DialogDescription>
					</DialogHeader>
					<AddPetForm />
				</DialogContent>
			</Dialog>
		</section>
	);
}

export default PetsPage;

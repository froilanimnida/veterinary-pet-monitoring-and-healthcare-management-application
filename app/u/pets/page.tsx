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
	];

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
			{pets.map((pet, index) => (
				<Card key={index}>
					<CardHeader>
						<CardTitle>{pet.name}</CardTitle>
						<CardDescription>{pet.breed}</CardDescription>
					</CardHeader>
					<CardContent>
						<img
							className='w-full h-40 object-cover'
							src={pet.image}
							alt={pet.name}
						/>
					</CardContent>
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
		</section>
	);
}

export default PetsPage;

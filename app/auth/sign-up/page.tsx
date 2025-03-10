import React from 'react';
import { Metadata } from 'next';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ResponsiveContainer from '@/components/shared/layout/responsive-container';

export const metadata: Metadata = {
	title: 'PawsitiveHealth | SignUp',
	description: 'PawsitiveHealth is a pet health care service.',
};

const SignUp = () => {
	return (
		<ResponsiveContainer className='flex justify-center items-center'>
			<section className='flex justify-center items-center max-w-1/2 mx-auto'>
				<Card>
					<CardHeader>
						<CardTitle>Sign Up</CardTitle>
						<CardDescription>
							Sign up to access the full features of the app
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Input
							type='text'
							placeholder='First Name'
							className='mb-4'
						/>
						<Input
							type='text'
							placeholder='Last Name'
							className='mb-4'
						/>
						<Input
							type='text'
							placeholder='Email'
							className='mb-4'
						/>
						<Input
							type='password'
							placeholder='Password'
							className='mb-4'
						/>
						<Input
							type='password'
							placeholder='Confirm Password'
							className='mb-4'
						/>
					</CardContent>
					<CardFooter className='flex flex-col gap-4'>
						<Button>Create account</Button>
						<Link href={'/auth/login'}>Login instead</Link>
					</CardFooter>
				</Card>
			</section>
		</ResponsiveContainer>
	);
};
export default SignUp;

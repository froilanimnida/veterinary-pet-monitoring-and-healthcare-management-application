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
	title: 'PawsitiveHealth | Login',
	description: 'PawsitiveHealth is a pet health care service.',
};

const LoginPage = () => {
	return (
		<ResponsiveContainer className='flex justify-center items-center'>
			<section className='flex justify-center items-center max-w-1/2 mx-auto'>
				<Card>
					<CardHeader>
						<CardTitle>Hello There!</CardTitle>
						<CardDescription>Login to continue</CardDescription>
					</CardHeader>
					<CardContent>
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
					</CardContent>
					<CardFooter className='flex flex-col gap-4'>
						<Button>Login</Button>
						<Link href={'/auth/sign-up'}>Sign up instead</Link>
					</CardFooter>
				</Card>
			</section>
		</ResponsiveContainer>
	);
};

export default LoginPage;

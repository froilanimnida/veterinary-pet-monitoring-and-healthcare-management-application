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
import Link from 'next/link';
import ResponsiveContainer from '@/components/shared/layout/responsive-container';
import UserSignUpForm from '@/components/form/user-sign-up-form';

export const metadata: Metadata = {
	title: 'PawsitiveHealth | Sign Up',
	description: 'Create your account',
};

const SignUp = () => {
	return (
		<ResponsiveContainer className='flex justify-center items-center'>
			<Card>
				<CardHeader>
					<CardTitle>Sign Up</CardTitle>
					<CardDescription>
						Sign up to access the full features of the app
					</CardDescription>
				</CardHeader>
				<CardContent>
					<UserSignUpForm />
				</CardContent>
				<CardFooter className='flex justify-center'>
					<Link
						href={'/auth/login'}
						className='text-sm'>
						Login instead
					</Link>
				</CardFooter>
			</Card>
		</ResponsiveContainer>
	);
};
export default SignUp;

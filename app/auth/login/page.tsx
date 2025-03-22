import React from 'react';
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	CardContent,
} from '@/components/ui/card';
import { Metadata } from 'next';
import Link from 'next/link';
import ResponsiveContainer from '@/components/shared/layout/responsive-container';
import UserLoginForm from '@/components/form/user-login-form';

export const metadata: Metadata = {
	title: 'Pawsitive | Login',
	description: 'Login to your account',
};

const LoginPage = async () => {
	return (
		<ResponsiveContainer className='flex justify-center items-center'>
			<Card>
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription>Login to continue</CardDescription>
				</CardHeader>
				<CardContent>
					<UserLoginForm />
				</CardContent>
				<CardFooter className='flex justify-center'>
					<Link
						href={'/auth/sign-up'}
						className='text-sm'>
						Sign up instead
					</Link>
				</CardFooter>
			</Card>
		</ResponsiveContainer>
	);
};

export default LoginPage;

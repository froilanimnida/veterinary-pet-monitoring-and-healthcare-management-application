import React from 'react';
import MaxWidthContainer from '@/components/shared/layout/max-width-container';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import ClientSignUpForm from '@/components/form/clinic-form';

function ClientSignUp() {
	return (
		<MaxWidthContainer>
			<Card>
				<CardHeader>
					<CardTitle>Sign Up</CardTitle>
					<CardDescription>Create new clinic account</CardDescription>
				</CardHeader>
				<ClientSignUpForm />
			</Card>
		</MaxWidthContainer>
	);
}

export default ClientSignUp;

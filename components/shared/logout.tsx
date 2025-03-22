'use client';
import React from 'react';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
function LogoutButton() {
	return (
		<Button
			onClick={() => signOut()}
			variant={'ghost'}
			size={'sm'}>
			<LogOut />
			Log out
		</Button>
	);
}

export default LogoutButton;

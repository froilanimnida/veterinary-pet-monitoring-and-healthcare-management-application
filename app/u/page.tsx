'use client';
import { useSession } from 'next-auth/react';

function UserDashboard() {
	const { data: session } = useSession();

	return (
		<div>
			<h1>Welcome, {session?.user?.name || 'Guest'}!</h1>
			<p>Your role: {session?.user?.role || 'No role assigned'}</p>
		</div>
	);
}

export default UserDashboard;

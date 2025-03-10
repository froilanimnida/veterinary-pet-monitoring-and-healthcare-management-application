import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

function UserDashboard() {
	return (
		<div>
			<SidebarProvider>
				<AppSidebar />
			</SidebarProvider>
		</div>
	);
}

export default UserDashboard;

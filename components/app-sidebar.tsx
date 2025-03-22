'use client';

import * as React from 'react';
import {
	Settings2,
	Dog,
	BookmarkCheckIcon,
} from 'lucide-react';

import { NavMenus } from '@/components/nav-menus';
import { NavUser } from '@/components/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarRail,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';

const data = {
	projects: [
		{
			name: 'My Pets',
			url: '/u/pets',
			icon: Dog,
		},
		{
			name: 'Settings',
			url: '/u/settings',
			icon: Settings2,
		},
		{
			name: 'My Booking',
			url: '/u/appointments',
			icon: BookmarkCheckIcon,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const userStore = useAuthStore();
	const userData = {
		name: userStore.user?.email,
		email: userStore.user?.email,
	};
	return (
		<Sidebar
			collapsible='offcanvas'
			{...props}>
			<SidebarContent>
				<NavMenus projects={data.projects} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={userData} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

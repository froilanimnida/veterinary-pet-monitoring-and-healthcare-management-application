import { ReactNode } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

async function ClientLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className='min-h-screen flex'>
			<SidebarProvider>
				<AppSidebar variant='floating' />
			</SidebarProvider>
			{children}
		</div>
	);
}

export default ClientLayout;

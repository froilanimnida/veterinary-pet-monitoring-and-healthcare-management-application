import React from "react";
import { AppSidebar } from "@/components/app-sidebar";

async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen">
            <AppSidebar variant="floating" />
            {children}
        </div>
    );
}

export default AdminLayout;

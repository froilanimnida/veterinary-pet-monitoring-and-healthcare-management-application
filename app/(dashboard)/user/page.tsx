import type { Metadata } from "next";
import { Suspense } from "react";
import { UpcomingHealthcareDashboard } from "@/components/dashboard/upcoming-healthcare";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = {
    title: "PawsitiveHealth | User Dashboard",
    description: "User dashboard for PawsitiveHealth.",
};
// Skeleton loader for the dashboard components
function DashboardSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 animate-pulse">
            <Card>
                <CardHeader>
                    <div className="h-7 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded-md"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="h-7 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded-md"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const UserDashboard = () => {
    return (
        <div className="container mx-auto py-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
                <p className="text-muted-foreground">Monitor your pet&apos;s health all in one place</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>At a Glance</CardTitle>
                    <CardDescription>Quick overview of your pet&apos;s upcoming healthcare needs</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DashboardSkeleton />}>
                        <UpcomingHealthcareDashboard />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserDashboard;

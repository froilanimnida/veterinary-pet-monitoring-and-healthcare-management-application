import { SkeletonCard } from "@/components/ui";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Appointments } from "./appointments/page";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Doctor Dashboard",
    description: "PawsitiveHealth is a pet health care service.",
};
function DoctorDashboard() {
    return (
        <section className="p-4 w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">My Appointments</h1>
            </div>
            <Suspense
                fallback={
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 16 }, (_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                }
            >
                <Appointments />
            </Suspense>
        </section>
    );
}

export default DoctorDashboard;

import React, { Suspense } from "react";
import { Metadata } from "next";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { getClinicAppointments } from "@/actions/appointment";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Client Appointments",
    description: "PawsitiveHealth is a pet health care service.",
};

const Appointments = async () => {
    const clinicAppointments = await getClinicAppointments();
    if (!clinicAppointments || clinicAppointments.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">No appointments found</h3>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4">
            {clinicAppointments.map((appointment) => (
                <Card key={appointment.appointment_id}>
                    <CardHeader>
                        <CardTitle>{appointment.pets?.name}</CardTitle>
                        <CardDescription>
                            {appointment.veterinarians?.users?.first_name} {appointment.veterinarians?.users?.last_name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>{appointment.appointment_date.toDateString()}</CardContent>
                    <CardFooter>
                        <Button>Manage</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

const AppointmentsPage = () => {
    return (
        <section className="p-4 w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Appointments</h1>
            </div>
            <Suspense fallback={<SkeletonCard />}>
                <Appointments />
            </Suspense>
        </section>
    );
};

export default AppointmentsPage;

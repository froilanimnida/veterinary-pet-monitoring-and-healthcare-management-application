import { getPets } from "@/actions/pets";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClinics } from "@/actions/clinic";
import type { Metadata } from "next";
import AppointmentForm from "@/components/form/appointment-form/index";

export const metadata: Metadata = {
    title: "PawsitiveHealth | New Appointment",
    description: "PawsitiveHealth is a pet health care service.",
};

const NewAppointment = async ({ params }: { params: Promise<{ uuid: string }> }) => {
    const { uuid } = await params;
    const pets = await getPets();
    const clinics = await getClinics();
    return (
        <Card>
            <CardHeader>
                <CardTitle>New Appointment</CardTitle>
                <CardDescription>Book a new appointment</CardDescription>
            </CardHeader>
            <CardContent>
                <AppointmentForm params={{ uuid, pets, clinics }} />
            </CardContent>
        </Card>
    );
};

export default NewAppointment;

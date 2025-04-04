import React from "react";
import { AppointmentCard } from "@/components/shared/appointment-card";
import { notFound } from "next/navigation";
import { getAppointment } from "@/actions";
import { type Metadata } from "next";

export const metadata: Metadata = {
    title: "View Appointment | PawsitiveHealth",
    description: "View your pet's appointment details",
};

const ViewAppointment = async ({ params }: { params: Promise<{ uuid: string }> }) => {
    const { uuid } = await params;
    const appointmentResponse = await getAppointment(uuid, true);
    if (!appointmentResponse.success || !appointmentResponse.data?.appointment) notFound();
    const { appointment } = appointmentResponse.data;
    return (
        <div>
            <AppointmentCard appointment={appointment} viewerType="vet" />
        </div>
    );
};

export default ViewAppointment;

import { AppointmentCard } from "@/components/shared/appointment-card";
import { notFound } from "next/navigation";
import { getAppointment } from "@/actions";
import { type Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { AppointmentHealthcareForms } from "@/components/form/appointment-healthcare-forms";

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
        <>
            <AppointmentCard appointment={appointment} viewerType="vet" />
            {appointmentResponse.data.appointment.status === "confirmed" && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Record Services</CardTitle>
                        <CardDescription>
                            Document services provided during this appointment for {appointment.pets?.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AppointmentHealthcareForms
                            petUuid={"232321313"}
                            appointmentUuid={appointment.appointment_uuid}
                        />
                    </CardContent>
                </Card>
            )}
        </>
    );
};

export default ViewAppointment;

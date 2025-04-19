import { Suspense } from "react";
import { Metadata } from "next";
import { getClinicAppointments } from "@/actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Button,
    SkeletonCard,
    Badge,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui";
import Link from "next/link";
import { cn, toTitleCase } from "@/lib";
import { statusColors } from "@/components/shared/appointment-card";
import { AppointmentWithRelations } from "@/actions/appointment";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Client Appointments",
    description: "PawsitiveHealth is a pet health care service.",
};

const statusPriority = {
    requested: 1,
    pending: 2,
    confirmed: 3,
    completed: 4,
    cancelled: 5,
};

const AppointmentCard = ({ appointment }: { appointment: AppointmentWithRelations }) => (
    <Card key={appointment.appointment_id}>
        <CardHeader>
            <CardTitle>{appointment.pets?.name}</CardTitle>
            <CardDescription>
                {appointment.veterinarians?.users?.first_name} {appointment.veterinarians?.users?.last_name}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Badge className={cn("px-3 py-1 text-sm", statusColors[appointment.status] || "bg-gray-100")}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Badge>
            <div className="flex flex-col space-y-2 mt-3">
                <div>
                    <span className="font-semibold">Date:</span>{" "}
                    {appointment.appointment_date.toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                    })}
                </div>
                <div>
                    <span className="font-semibold">Time:</span>{" "}
                    {appointment.appointment_date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
                <div>
                    <span className="font-semibold">Type:</span> {toTitleCase(appointment.appointment_type)}
                </div>
                {appointment.notes && (
                    <div>
                        <span className="font-semibold">Notes:</span> {appointment.notes}
                    </div>
                )}
            </div>
        </CardContent>
        <CardFooter>
            <Button asChild>
                <Link href={`/clinic/appointments/${appointment.appointment_uuid}`} className="w-full">
                    View Details
                </Link>
            </Button>
        </CardFooter>
    </Card>
);

const Appointments = async () => {
    const clinicAppointments = await getClinicAppointments();
    const appointments = clinicAppointments.success ? (clinicAppointments.data?.appointments ?? []) : [];

    if (!appointments || appointments.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">No appointments found</h3>
            </div>
        );
    }

    const groupedAppointments = appointments.reduce(
        (acc, appointment) => {
            const status = appointment.status;
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(appointment);
            return acc;
        },
        {} as Record<string, typeof appointments>,
    );

    const statuses = Object.keys(groupedAppointments).sort(
        (a, b) =>
            (statusPriority[a as keyof typeof statusPriority] || 99) -
            (statusPriority[b as keyof typeof statusPriority] || 99),
    );

    const countByStatus = statuses.reduce(
        (acc, status) => {
            acc[status] = groupedAppointments[status].length;
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalAppointments = appointments.length;

    return (
        <div className="w-full">
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 flex flex-wrap">
                    <TabsTrigger value="all" className="relative">
                        All
                        <Badge variant="secondary" className="ml-2">
                            {totalAppointments}
                        </Badge>
                    </TabsTrigger>

                    {statuses.map((status) => (
                        <TabsTrigger key={status} value={status} className="relative">
                            {toTitleCase(status)}
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "ml-2",
                                    status === "requested" && "bg-amber-100 text-amber-800",
                                    status === "pending" && "bg-blue-100 text-blue-800",
                                    status === "confirmed" && "bg-green-100 text-green-800",
                                    status === "completed" && "bg-purple-100 text-purple-800",
                                    status === "cancelled" && "bg-red-100 text-red-800",
                                )}
                            >
                                {countByStatus[status]}
                            </Badge>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4">
                        {appointments
                            .sort(
                                (a, b) =>
                                    (statusPriority[a.status as keyof typeof statusPriority] || 99) -
                                    (statusPriority[b.status as keyof typeof statusPriority] || 99),
                            )
                            .map((appointment) => (
                                <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                            ))}
                    </div>
                </TabsContent>

                {statuses.map((status) => (
                    <TabsContent key={status} value={status}>
                        <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4">
                            {groupedAppointments[status].map((appointment) => (
                                <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                            ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
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

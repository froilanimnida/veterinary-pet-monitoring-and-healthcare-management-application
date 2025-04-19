import { Suspense } from "react";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    SkeletonCard,
    Badge,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui";
import { type Metadata } from "next";
import { getVeterinarianAppointments } from "@/actions";
import Link from "next/link";
import { cn, toTitleCase } from "@/lib";
import type { VetAppointmentWithRelations } from "@/actions/appointment";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Veterinary Appointments",
    description: "PawsitiveHealth is a pet health care service.",
};

const statusColors: Record<string, string> = {
    requested: "bg-amber-100 text-amber-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-gray-100 text-gray-800",
    checked_in: "bg-teal-100 text-teal-800",
};

const getTimeGroup = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate.getTime() === today.getTime()) return "today";
    if (appointmentDate.getTime() === tomorrow.getTime()) return "tomorrow";
    if (appointmentDate > today && appointmentDate < nextWeek) return "this-week";
    if (appointmentDate < today) return "past";
    return "upcoming";
};

const AppointmentCard = ({ appointment }: { appointment: VetAppointmentWithRelations }) => (
    <Card key={appointment.appointment_id}>
        <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
                {toTitleCase(appointment.pets?.name)}
                <Badge className={cn("ml-2", statusColors[appointment.status] || "bg-gray-100")}>
                    {toTitleCase(appointment.status)}
                </Badge>
            </CardTitle>
            <CardDescription>
                Owner: {appointment.pets?.users?.first_name} {appointment.pets?.users?.last_name}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                    <span className="font-semibold">Date:</span>
                    <span>
                        {appointment.appointment_date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold">Time:</span>
                    <span>
                        {appointment.appointment_date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold">Type:</span>
                    <span>{toTitleCase(appointment.appointment_type)}</span>
                </div>
                {appointment.notes && (
                    <div className="mt-2 pt-2 border-t">
                        <p className="font-semibold text-sm mb-1">Notes:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{appointment.notes}</p>
                    </div>
                )}
            </div>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
                <Link href={`/vet/appointments/${appointment.appointment_uuid}`}>Manage</Link>
            </Button>
        </CardFooter>
    </Card>
);

export const Appointments = async () => {
    const appointmentsResponse = await getVeterinarianAppointments();
    const appointments = appointmentsResponse.success ? (appointmentsResponse.data?.appointments ?? []) : [];

    if (!appointments || appointments.length === 0) {
        return (
            <div className="text-center py-10 w-full mx-auto">
                <h3 className="text-lg font-medium">No appointments found</h3>
                <p className="text-muted-foreground">You have no upcoming appointments</p>
            </div>
        );
    }

    // Time-based grouping (primary grouping for vets)
    const timeGroups = {
        today: appointments.filter((app) => getTimeGroup(app.appointment_date) === "today"),
        tomorrow: appointments.filter((app) => getTimeGroup(app.appointment_date) === "tomorrow"),
        "this-week": appointments.filter((app) => getTimeGroup(app.appointment_date) === "this-week"),
        upcoming: appointments.filter((app) => getTimeGroup(app.appointment_date) === "upcoming"),
        past: appointments.filter((app) => getTimeGroup(app.appointment_date) === "past"),
    };

    const statusGroups = {
        requested: appointments.filter((app) => app.status === "requested"),
        confirmed: appointments.filter((app) => app.status === "confirmed"),
        checked_in: appointments.filter((app) => app.status === "checked_in"),
        completed: appointments.filter((app) => app.status === "completed"),
        cancelled: appointments.filter((app) => app.status === "cancelled"),
        no_show: appointments.filter((app) => app.status === "no_show"),
    };

    const timeGroupLabels = {
        today: "Today",
        tomorrow: "Tomorrow",
        "this-week": "This Week",
        upcoming: "Upcoming",
        past: "Past Appointments",
    };

    const todayCount = timeGroups.today.length;
    const requested = statusGroups.requested.length;
    const requestedCount = statusGroups.requested.length;

    return (
        <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="mb-4 flex flex-wrap">
                <TabsTrigger value="timeline" className="relative">
                    Timeline View
                </TabsTrigger>
                <TabsTrigger value="today" className="relative">
                    Today
                    {todayCount > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                            {todayCount}
                        </Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="requested" className="relative">
                    Requested
                    {requestedCount > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                            {requestedCount}
                        </Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="pending" className="relative">
                    Pending
                    {requested > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                            {requested}
                        </Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="status" className="relative">
                    By Status
                </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
                {Object.entries(timeGroups)
                    .filter(([appts]) => appts.length > 0)
                    .map(([timeGroup, appts]) => (
                        <div key={timeGroup} className="mb-8">
                            <h2 className="text-xl font-bold mb-4">
                                {timeGroupLabels[timeGroup as keyof typeof timeGroupLabels]}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {appts
                                    .sort(
                                        (a, b) =>
                                            new Date(a.appointment_date).getTime() -
                                            new Date(b.appointment_date).getTime(),
                                    )
                                    .map((appointment) => (
                                        <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                                    ))}
                            </div>
                        </div>
                    ))}
            </TabsContent>
            <TabsContent value="today">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {timeGroups.today.length > 0 ? (
                        timeGroups.today
                            .sort(
                                (a, b) =>
                                    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime(),
                            )
                            .map((appointment) => (
                                <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                            ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <h3 className="text-lg font-medium">No appointments for today</h3>
                        </div>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="requested">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {statusGroups.requested.length > 0 ? (
                        statusGroups.requested
                            .sort(
                                (a, b) =>
                                    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime(),
                            )
                            .map((appointment) => (
                                <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                            ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <h3 className="text-lg font-medium">No requested appointments</h3>
                        </div>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="pending">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {statusGroups.requested.length > 0 ? (
                        statusGroups.requested
                            .sort(
                                (a, b) =>
                                    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime(),
                            )
                            .map((appointment) => (
                                <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                            ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <h3 className="text-lg font-medium">No requested appointments</h3>
                        </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="status">
                {Object.entries(statusGroups)
                    .filter(([appts]) => appts.length > 0)
                    .map(([status, appts]) => (
                        <div key={status} className="mb-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                {toTitleCase(status)}
                                <Badge className={cn("ml-2", statusColors[status] || "bg-gray-100")}>
                                    {appts.length}
                                </Badge>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {appts
                                    .sort(
                                        (a, b) =>
                                            new Date(a.appointment_date).getTime() -
                                            new Date(b.appointment_date).getTime(),
                                    )
                                    .map((appointment) => (
                                        <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
                                    ))}
                            </div>
                        </div>
                    ))}
            </TabsContent>
        </Tabs>
    );
};

const VeterinaryAppointment = () => {
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
};

export default VeterinaryAppointment;

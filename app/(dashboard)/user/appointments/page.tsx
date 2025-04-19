import { Suspense } from "react";
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    SkeletonCard,
} from "@/components/ui";
import type { Metadata } from "next";
import { getUserAppointments } from "@/actions";
import Link from "next/link";
import { cn, toTitleCase } from "@/lib";
import { statusColors } from "@/components/shared/appointment-card";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Appointments",
    description: "PawsitiveHealth is a pet health care service.",
};

const AppointmentsHistory = async () => {
    const data = await getUserAppointments();
    const appointments = data.success ? (data.data?.appointments ?? []) : [];
    if (!appointments || appointments.length === 0) {
        return (
            <div className="text-center py-10 w-full mx-auto">
                <h3 className="text-lg font-medium">No appointments found</h3>
                <p className="text-muted-foreground">Add your first appointment to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 w-full lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {appointments.map((appointment) => (
                <Card className="w-full" key={appointment.appointment_id}>
                    <CardHeader>
                        <CardTitle>{toTitleCase(appointment.pets?.name ?? "")}</CardTitle>
                        <CardDescription>
                            {toTitleCase(appointment.veterinarians?.users?.first_name)}{" "}
                            {toTitleCase(appointment.veterinarians?.users?.last_name)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge className={cn("px-3 py-1 text-sm", statusColors[appointment.status] || "bg-gray-100")}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        <div className="flex flex-col space-y-2">
                            <div>
                                <span className="font-semibold">Date:</span>{" "}
                                {appointment.appointment_date.toDateString()}
                            </div>
                            <div>
                                <span className="font-semibold">Time:</span>{" "}
                                {appointment.appointment_date.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                            <div>
                                <span className="font-semibold">Type:</span> {toTitleCase(appointment.appointment_type)}
                            </div>
                            <div>
                                <span className="font-semibold">Notes:</span> {appointment.notes}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant={"outline"}>
                            <Link href={`/user/appointments/view/${appointment.appointment_uuid}`}>View</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

function Appointments() {
    return (
        <section className="p-4 w-full min-h-screen">
            <div className="w-full flex flex-row justify-between">
                <h1 className="text-2xl font-bold mb-6">Appointments</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>New Appointment</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Appointment</DialogTitle>
                            <DialogDescription>
                                Please select a pet and a veterinarian to create a new appointment.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button asChild>
                                    <Link href="/user/pets">Okay</Link>
                                </Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Suspense
                fallback={Array.from({ length: 16 }, (_, i) => (
                    <SkeletonCard key={i} />
                ))}
            >
                <AppointmentsHistory />
            </Suspense>
        </section>
    );
}

export default Appointments;

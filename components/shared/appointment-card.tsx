import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Stethoscope, XCircle, CheckCircle, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toTitleCase } from "@/lib/functions/text/title-case";
import { formatDecimal } from "@/lib/functions/format-decimal";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui";
import { CancelAppointmentButton } from "./cancel-appointment-button";
import { AppointmentDetailsResponse } from "@/types/actions/appointments";
import { AcceptAppointmentButton } from "./accept-appointment-button";
import { CheckInButton } from "./checked-in-button";

export const statusColors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800 border-green-200",
    requested: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-purple-100 text-purple-800 border-purple-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export function AppointmentCard({
    appointment,
    viewerType,
    additionalActions,
    showFooter = true,
}: {
    appointment: AppointmentDetailsResponse;
    viewerType: "user" | "vet" | "clinic";
    additionalActions?: React.ReactNode;
    showFooter?: boolean;
}) {
    const appointmentDate = new Date(appointment.appointment_date);
    const dateString = format(appointmentDate, "EEEE, MMMM d, yyyy");
    const timeString = format(appointmentDate, "h:mm a");

    const vetName = appointment.veterinarians?.users
        ? `${appointment.veterinarians.users.first_name} ${appointment.veterinarians.users.last_name}`
        : "Unknown Veterinarian";

    return (
        <Card className="w-full">
            <CardHeader className="pb-0">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-2xl">Appointment Details</CardTitle>
                    <Badge className={cn("px-3 py-1 text-sm", statusColors[appointment.status] || "bg-gray-100")}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                </div>
                <CardDescription>
                    Appointment #{appointment.appointment_uuid} • Created{" "}
                    {format(new Date(appointment.created_at || new Date()), "MMM d, yyyy")}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-700" />
                        <div>
                            <div className="font-medium text-blue-900">{dateString}</div>
                            <div className="text-sm text-blue-700">Appointment Date</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-700" />
                        <div>
                            <div className="font-medium text-blue-900">{timeString}</div>
                            <div className="text-sm text-blue-700">Appointment Time</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-700" />
                        <div>
                            <div className="font-medium text-blue-900">
                                {appointment.duration_minutes || 30} minutes
                            </div>
                            <div className="text-sm text-blue-700">Duration</div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        {(viewerType === "vet" || viewerType === "clinic") && appointment.pets && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Pet Information</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="bg-gray-100 rounded-full p-3">
                                            <User className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{toTitleCase(appointment.pets.name)}</div>
                                            <div className="text-sm text-gray-500">
                                                {toTitleCase(appointment.pets.species)},{" "}
                                                {toTitleCase(appointment.pets.breed) || "Mixed Breed"} •{" "}
                                                {formatDecimal(appointment.pets.weight_kg)} kg
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(viewerType === "user" || viewerType === "clinic") && appointment.veterinarians && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Veterinarian</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="bg-gray-100 rounded-full p-3">
                                            <Stethoscope className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Dr. {vetName}</div>
                                            <div className="text-sm text-gray-500">
                                                {toTitleCase(appointment.veterinarians.specialization ?? "")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {viewerType === "user" && appointment.clinics && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Clinic</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="bg-gray-100 rounded-full p-3">
                                            <MapPin className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{appointment.clinics.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {appointment.clinics.address}, {appointment.clinics.city},{" "}
                                                {appointment.clinics.state} {appointment.clinics.postal_code}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {appointment.clinics.phone_number}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">Appointment Details</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <div className="p-4 space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-500">Appointment Type</div>
                                        <div className="font-medium">{toTitleCase(appointment.appointment_type)}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500">Notes</div>
                                        <div className="bg-gray-50 p-3 rounded-md mt-1 text-gray-700">
                                            {appointment.notes || "No additional notes provided."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>

            {showFooter && (
                <CardFooter className="flex justify-between border-t p-6 bg-gray-50">
                    <div className="flex gap-2">
                        {appointment.status !== "cancelled" && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancel Appointment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently mark this appointment as
                                            cancelled.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <CancelAppointmentButton appointmentUuid={appointment.appointment_uuid} />
                                        <DialogClose asChild>
                                            <Button variant="default">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {appointment.status === "confirmed" && viewerType === "vet" && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="default">
                                        <Check className="mr-2 h-4 w-4" />
                                        Check-in
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                                        <DialogDescription>
                                            Please make sure that the user is inside the premise and is ready for the
                                            appointment.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <CheckInButton appointmentUuid={appointment.appointment_uuid} />
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {appointment.status === "requested" && (viewerType === "vet" || viewerType === "clinic") && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Accept Appointment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently mark this appointment as
                                            accepted. We&apos;ll send a confirmation to the user.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <AcceptAppointmentButton appointmentUuid={appointment.appointment_uuid} />
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {appointment.status === "checked_in" && viewerType === "vet" && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Finalize Appointment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently mark this appointment as
                                            completed. We&apos;ll send a confirmation to the user.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <AcceptAppointmentButton appointmentUuid={appointment.appointment_uuid} />
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* {appointment.status !== "cancelled" && onReschedule && (
                            <Button variant="outline" onClick={() => onReschedule(appointment.appointment_uuid)}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Reschedule
                            </Button>
                        )} */}
                    </div>

                    {additionalActions && <div className="flex gap-2">{additionalActions}</div>}
                </CardFooter>
            )}
        </Card>
    );
}

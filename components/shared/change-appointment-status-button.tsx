"use client";

import { Button } from "@/components/ui";
import { changeAppointmentStatus } from "@/actions/appointment";
import { toast } from "sonner";
import type { appointment_status } from "@prisma/client";

interface ChangeAppointmentStatusButtonProps {
    appointmentUuid: string;
    status: appointment_status;
    onStatusChanged?: () => void;
}

function ChangeAppointmentStatusButton({
    appointmentUuid,
    status,
    onStatusChanged,
}: ChangeAppointmentStatusButtonProps) {
    const handleAppointmentStatusChange = async () => {
        let newStatus: appointment_status = "checked_in";

        // Determine the next status based on current status
        if (status === "confirmed") {
            newStatus = "checked_in";
        } else if (status === "checked_in") {
            newStatus = "completed";
        }

        toast.promise(changeAppointmentStatus(appointmentUuid, newStatus), {
            loading: `Updating appointment status...`,
            success: () => {
                if (onStatusChanged) {
                    onStatusChanged();
                }
                return `Appointment marked as ${newStatus.replace("_", " ")}`;
            },
            error: (err) => {
                return err.message || "Failed to update appointment status";
            },
        });
    };

    // Only show the button for confirmed or checked-in appointments
    if (status === "confirmed") {
        return (
            <Button variant="default" size="sm" onClick={handleAppointmentStatusChange}>
                Check-in Patient
            </Button>
        );
    }

    if (status === "checked_in") {
        return (
            <Button variant="default" size="sm" onClick={handleAppointmentStatusChange}>
                Complete Appointment
            </Button>
        );
    }

    // Return null for other statuses
    return null;
}

export default ChangeAppointmentStatusButton;

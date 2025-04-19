import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointment_type, type vet_availability } from "@prisma/client";
import { AppointmentSchema, AppointmentType } from "@/schemas";
import { addMinutes, format } from "date-fns";
import {
    getVeterinariansByClinic,
    getVeterinaryAvailability,
    createUserAppointment,
    getExistingAppointments,
} from "@/actions";
import { toTitleCase } from "@/lib";
import { toast } from "sonner";

export interface TimeSlot {
    time: string;
    available: boolean;
    statusMessage?: string | null;
    appointmentId?: string | null;
}

export function useAppointmentForm(uuid: string) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedClinicId, setSelectedClinicId] = useState<string>("");
    const [selectedVetId, setSelectedVetId] = useState<string>("");
    const [veterinarians, setVeterinarians] = useState<{ label: string; value: string }[]>([]);
    const [isLoadingVets, setIsLoadingVets] = useState<boolean>(false);
    const [vetAvailability, setVetAvailability] = useState<vet_availability[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm({
        defaultValues: {
            notes: "",
            appointment_type: appointment_type.behavioral_consultation,
            vet_id: "",
            pet_uuid: uuid,
            clinic_id: "",
            appointment_date: undefined,
            duration_minutes: 0,
        },
        resolver: zodResolver(AppointmentSchema),
        progressive: true,
        shouldFocusError: true,
    });

    useEffect(() => {
        const loadVeterinarians = async () => {
            if (!selectedClinicId) {
                setVeterinarians([]);
                return;
            }
            setIsLoadingVets(true);
            try {
                const data = await getVeterinariansByClinic(selectedClinicId);
                const vets = data.success ? data.data.veterinarians : [];
                setVeterinarians(
                    vets.map((vet) => ({
                        label: `${vet.name} (${toTitleCase(vet.specialization)})`,
                        value: vet.id.toString(),
                    })),
                );
            } catch {
                setVeterinarians([]);
            } finally {
                setIsLoadingVets(false);
            }
        };
        loadVeterinarians();
    }, [selectedClinicId]);
    useEffect(() => {
        const loadTimeSlots = async () => {
            if (!selectedDate || !selectedVetId || !selectedClinicId) {
                setTimeSlots([]);
                return;
            }

            setIsLoadingTimeSlots(true);
            try {
                const dayOfWeek = selectedDate.getDay();

                const data = await getVeterinaryAvailability(Number(selectedVetId));
                const availability = data.success ? data.data.availability : [];
                setVetAvailability(availability);

                const dayAvailability = availability.find((a) => {
                    const matches =
                        a.day_of_week === dayOfWeek &&
                        a.vet_id === Number(selectedVetId) &&
                        a.clinic_id === Number(selectedClinicId) &&
                        a.is_available;
                    return matches;
                });
                if (!dayAvailability) {
                    setTimeSlots([]);
                    return;
                }
                const existingData = await getExistingAppointments(selectedDate, Number(selectedVetId));
                const appointments = existingData.success ? existingData.data.appointments : [];

                const slots: TimeSlot[] = [];

                const startTime = new Date(dayAvailability.start_time);
                const endTime = new Date(dayAvailability.end_time);

                let currentSlot = new Date(selectedDate);
                currentSlot.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

                const slotEndTime = new Date(selectedDate);
                slotEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

                while (currentSlot < slotEndTime) {
                    const slotStartTime = new Date(currentSlot);
                    const slotEndTime = addMinutes(currentSlot, 30);

                    const matchingAppointments = appointments.filter((appointment) => {
                        const appointmentTime = new Date(appointment.appointment_date);
                        const appointmentEndTime = addMinutes(appointmentTime, appointment.duration_minutes || 30);
                        const hasOverlap =
                            (slotStartTime >= appointmentTime && slotStartTime < appointmentEndTime) ||
                            (slotEndTime > appointmentTime && slotEndTime <= appointmentEndTime) ||
                            (slotStartTime <= appointmentTime && slotEndTime >= appointmentEndTime);

                        return hasOverlap;
                    });

                    let statusMessage = null;
                    if (matchingAppointments.length > 0) {
                        statusMessage = `Booked: ${matchingAppointments[0].status}`;
                    }

                    slots.push({
                        time: format(currentSlot, "h:mm a"),
                        available: matchingAppointments.length === 0,
                        statusMessage: statusMessage,
                        appointmentId:
                            matchingAppointments.length > 0 ? matchingAppointments[0].appointment_uuid : null,
                    });

                    currentSlot = addMinutes(currentSlot, 30);
                }
                setTimeSlots(slots);
            } catch {
                setTimeSlots([]);
            } finally {
                setIsLoadingTimeSlots(false);
            }
        };

        loadTimeSlots();
    }, [selectedDate, selectedVetId, selectedClinicId]);

    const onSubmit = async (values: AppointmentType) => {
        try {
            setLoading(true);
            if (!selectedDate) {
                toast.error("Please select a date");
                return;
            }
            const submissionData = { ...values };

            if (selectedDate && values.appointment_time) {
                const timeString = values.appointment_time;
                const [hourMinute, period] = timeString.split(" ");
                const [hourStr, minuteStr] = hourMinute.split(":");

                let hour = parseInt(hourStr);
                const minute = parseInt(minuteStr);

                if (period === "PM" && hour < 12) hour += 12;
                else if (period === "AM" && hour === 12) hour = 0;

                const appointmentDate = new Date(selectedDate);
                appointmentDate.setHours(hour, minute, 0, 0);

                submissionData.appointment_date = appointmentDate;
            } else {
                return;
            }
            toast.promise(createUserAppointment(submissionData), {
                loading: "Creating appointment...",
                success: (data) => {
                    if (data.success) return "Appointment created successfully!";
                    return data.error || "Failed to create appointment";
                },
                error: (err) => {
                    if (err instanceof Error) {
                        return err.message;
                    }
                    return "An unexpected error occurred";
                },
            });
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleClinicChange = (value: string) => {
        form.setValue("clinic_id", value);
        form.setValue("vet_id", "");
        setSelectedClinicId(value);
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        form.setValue("appointment_time", "");
    };

    const handleVetChange = (value: string) => {
        form.setValue("vet_id", value);
        setSelectedVetId(value);
    };

    return {
        form,
        selectedDate,
        selectedClinicId,
        selectedVetId,
        veterinarians,
        isLoadingVets,
        timeSlots,
        isLoadingTimeSlots,
        onSubmit: form.handleSubmit(onSubmit),
        handleClinicChange,
        handleDateSelect,
        handleVetChange,
        setSelectedVetId,
        vetAvailability,
        setLoading,
        loading,
    };
}

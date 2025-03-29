import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { appointment_type, type vet_availability } from "@prisma/client";
import { AppointmentSchema } from "@/schemas/appointment-definition";
import { addMinutes, format } from "date-fns";
import { getVeterinariansByClinic } from "@/actions/veterinary";
import { getVeterinaryAvailability } from "@/actions/veterinarian-availability";
import { getExistingAppointments } from "@/actions/appointment";
import { toTitleCase } from "@/lib/functions/text/title-case";

export interface TimeSlot {
    time: string;
    available: boolean;
}

export function useAppointmentForm(uuid: string) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedClinicId, setSelectedClinicId] = useState<string>("");
    const [selectedVetId, setSelectedVetId] = useState<string>("");
    const [veterinarians, setVeterinarians] = useState<{ label: string; value: string }[]>([]);
    const [isLoadingVets, setIsLoadingVets] = useState<boolean>(false);
    const [vetAvailability, setVetAvailability] = useState<vet_availability[]>([]);
    const [existingAppointments, setExistingAppointments] = useState<Date[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

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
                const vets = await getVeterinariansByClinic(selectedClinicId);
                setVeterinarians(
                    vets.map((vet) => ({
                        label: `${vet.name} (${toTitleCase(vet.specialization)})`,
                        value: vet.id,
                    })),
                );
            } catch (error) {
                console.error("Failed to load veterinarians:", error);
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
                const availability = await getVeterinaryAvailability(Number(selectedVetId));
                setVetAvailability(availability);
                console.log(availability);

                const dayAvailability = availability.find(
                    (a) =>
                        a.day_of_week === dayOfWeek &&
                        a.vet_id === Number(selectedVetId) &&
                        a.clinic_id === Number(selectedClinicId) &&
                        a.is_available,
                );

                if (!dayAvailability) {
                    setTimeSlots([]);
                    return;
                }

                const appointments = await getExistingAppointments(selectedDate, Number(selectedVetId));
                setExistingAppointments(appointments.map((app) => new Date(app.appointment_date)));

                const slots: TimeSlot[] = [];
                const startTime = new Date(dayAvailability.start_time);
                const endTime = new Date(dayAvailability.end_time);

                let currentSlot = new Date(selectedDate);
                currentSlot.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

                const slotEndTime = new Date(selectedDate);
                slotEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

                while (currentSlot < slotEndTime) {
                    const appointmentEndTime = addMinutes(currentSlot, 30);

                    const isAvailable = !appointments.some((appointment) => {
                        const appointmentTime = new Date(appointment.appointment_date);
                        const existingAppointmentEnd = addMinutes(appointmentTime, appointment.duration_minutes);

                        return (
                            (currentSlot >= appointmentTime && currentSlot < existingAppointmentEnd) ||
                            (appointmentEndTime > appointmentTime && appointmentEndTime <= existingAppointmentEnd) ||
                            (currentSlot <= appointmentTime && appointmentEndTime >= existingAppointmentEnd)
                        );
                    });

                    const wouldExtendBeyondAvailability = appointmentEndTime > slotEndTime;

                    slots.push({
                        time: format(currentSlot, "h:mm a"),
                        available: isAvailable && !wouldExtendBeyondAvailability,
                    });

                    currentSlot = addMinutes(currentSlot, 30); // Still step by 30 minute increments
                }

                setTimeSlots(slots);
            } catch (error) {
                console.error("Failed to load time slots:", error);
                setTimeSlots([]);
            } finally {
                setIsLoadingTimeSlots(false);
            }
        };

        loadTimeSlots();
    }, [selectedDate, selectedVetId, selectedClinicId]);

    const onSubmit = (values: z.infer<typeof AppointmentSchema>) => {
        if (values.appointment_date && values.appointment_time) {
            const timeParts = values.appointment_time.split(":");
            const [hours, minutesPeriod] = timeParts[1].split(" ");
            let hour = parseInt(timeParts[0]);
            const minutes = parseInt(minutesPeriod);

            if (timeParts[1].includes("PM") && hour < 12) {
                hour += 12;
            } else if (timeParts[1].includes("AM") && hour === 12) {
                hour = 0;
            }

            const dateTime = new Date(values.appointment_date);
            dateTime.setHours(hour, minutes, 0, 0);

            values.appointment_date = dateTime;
        }

        console.log(values);
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
    };
}

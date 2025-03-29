"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAppointmentForm } from "./use-appointment-form";
import { SelectFields } from "./components/select-fields.";
import { TextFields } from "./components/text-fields";
import { DateSelector } from "./components/date-selector";
import { TimeSelector } from "./components/time-selector";
import { getAppointmentFields, getAppointmentSelectFields } from "./fields";
import type { clinics } from "@prisma/client";
import { Pets } from "@/types/pets";

export function AppointmentForm({
    params,
}: {
    params: {
        uuid: string;
        pets: Pets[];
        clinics: clinics[];
    };
}) {
    const {
        form,
        selectedDate,
        selectedClinicId,
        selectedVetId,
        veterinarians,
        isLoadingVets,
        timeSlots,
        isLoadingTimeSlots,
        onSubmit,
        handleClinicChange,
        handleDateSelect,
        handleVetChange,
        // selectedDuration,
        // handleAppointmentTypeChange,
    } = useAppointmentForm(params.uuid);

    const textFields = getAppointmentFields();
    const selectFields = getAppointmentSelectFields(params, {
        veterinarians,
        isLoadingVets,
        handleClinicChange,
        handleVetChange,
        // handleAppointmentTypeChange,
        form: form,
    });

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-8">
                <SelectFields
                    fields={selectFields}
                    control={form.control}
                    selectedClinicId={selectedClinicId}
                    isLoadingVets={isLoadingVets}
                />

                <TextFields fields={textFields} control={form.control} />

                <DateSelector control={form.control} onSelect={handleDateSelect} />

                <TimeSelector
                    control={form.control}
                    selectedDate={selectedDate}
                    selectedVetId={selectedVetId}
                    timeSlots={timeSlots}
                    isLoadingTimeSlots={isLoadingTimeSlots}
                />
                {/* <div className="text-sm text-muted-foreground">Appointment duration: {selectedDuration} minutes</div> */}

                <Button type="submit">Add Appointment</Button>
            </form>
        </Form>
    );
}

export default AppointmentForm;

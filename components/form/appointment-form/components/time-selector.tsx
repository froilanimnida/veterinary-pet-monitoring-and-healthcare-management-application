import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeSlot } from "../use-appointment-form";
import type { Control } from "react-hook-form";

interface TimeSelectorProps {
    control: Control<any>;
    selectedDate?: Date;
    selectedVetId: string;
    timeSlots: TimeSlot[];
    isLoadingTimeSlots: boolean;
}

export function TimeSelector({
    control,
    selectedDate,
    selectedVetId,
    timeSlots,
    isLoadingTimeSlots,
}: TimeSelectorProps) {
    return (
        <FormField
            name="appointment_time"
            control={control}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Appointment Time</FormLabel>
                    <FormControl>
                        <div className="flex flex-col space-y-2">
                            {!selectedDate || !selectedVetId ? (
                                <p className="text-sm text-muted-foreground">
                                    Please select a date and veterinarian first
                                </p>
                            ) : isLoadingTimeSlots ? (
                                <p className="text-sm text-muted-foreground">Loading available times...</p>
                            ) : timeSlots.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No availability for this date</p>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {timeSlots.map((slot) => (
                                        <Button
                                            key={slot.time}
                                            type="button"
                                            size="sm"
                                            variant={field.value === slot.time ? "default" : "outline"}
                                            onClick={() => field.onChange(slot.time)}
                                            disabled={!slot.available}
                                            className={cn("justify-center", !slot.available && "opacity-50")}
                                        >
                                            <Clock className="mr-2 h-3 w-3" />
                                            {slot.time}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormDescription>Pick an available time slot</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

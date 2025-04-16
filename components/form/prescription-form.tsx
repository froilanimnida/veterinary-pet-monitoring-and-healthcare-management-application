"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Calendar,
} from "@/components/ui";
import { PrescriptionDefinition, type PrescriptionType } from "@/schemas/prescription-definition";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { z } from "zod";
import { addPrescription, getMedicationsList } from "@/actions";

const PrescriptionFormSchema = PrescriptionDefinition.extend({
    appointment_uuid: z.string().uuid().optional(),
    appointment_id: z.number().optional(),
    medication_id: z.number(),
});

interface PrescriptionFormProps {
    petId: number;
    petUuid?: string;
    appointmentUuid?: string;
    appointmentId?: number;
    vetId?: number;
    onSuccess?: () => void;
    onCancel?: () => void;
    isCheckIn?: boolean; // Flag to determine if the patient has checked in
}

const PrescriptionForm = ({
    petId,
    petUuid,
    appointmentUuid,
    appointmentId,
    vetId,
    onSuccess,
    onCancel,
    isCheckIn = true,
}: PrescriptionFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [medications, setMedications] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        const fetchMedications = async () => {
            try {
                const response = await getMedicationsList();
                if (!response.success) {
                    throw new Error(response.error || "Failed to fetch medications");
                }

                setMedications(
                    response.data.medication.map((med) => {
                        return {
                            id: med.medication_id,
                            name: med.name,
                        };
                    }),
                );
            } catch (error) {
                console.error("Error fetching medications:", error);
                toast.error("Could not load medications list. Please try again.");
            }
        };

        fetchMedications();
    }, []);

    const form = useForm({
        resolver: zodResolver(PrescriptionFormSchema),
        defaultValues: {
            pet_id: petId,
            pet_uuid: petUuid,
            appointment_uuid: appointmentUuid,
            appointment_id: appointmentId,
            vet_id: vetId,
            medication_id: undefined,
            dosage: "",
            frequency: "",
            start_date: new Date(),
            end_date: addDays(new Date(), 7),
            refills_remaining: 0,
        },
    });

    const onSubmit = async (data: PrescriptionType) => {
        setIsLoading(true);
        toast.loading("Issuing prescription...");

        try {
            const response = await addPrescription({
                ...data,
                pet_id: petId,
                appointment_id: appointmentId,
            });

            if (response && response.success) {
                toast.dismiss();
                toast.success("Prescription issued successfully");
                form.reset({
                    ...form.getValues(),
                    medication_id: undefined,
                    dosage: "",
                    frequency: "",
                    start_date: new Date(),
                    end_date: addDays(new Date(), 7),
                    refills_remaining: 0,
                });

                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.dismiss();
                toast.error(response?.error || "Failed to issue prescription");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("An unexpected error occurred");
            console.error("Error issuing prescription:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isCheckIn) {
        return (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                <h3 className="font-medium text-lg mb-2">Patient Check-in Required</h3>
                <p>
                    You can only issue prescriptions for patients who have checked in for their appointment. Please
                    check in the patient first.
                </p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="medication_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Medication</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
                                disabled={isLoading}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select medication" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {medications.map((med) => (
                                        <SelectItem key={med.id} value={med.id.toString()}>
                                            {med.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Select the medication to prescribe</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="dosage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dosage</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 10mg, 1 tablet" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormDescription>Amount of medication to take</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Twice daily, Every 8 hours"
                                        {...field}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormDescription>How often medication should be taken</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                                disabled={isLoading}
                                                type="button"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>When to start taking the medication</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                                disabled={isLoading}
                                                type="button"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < form.getValues("start_date")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>When to stop taking the medication</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="refills_remaining"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Refills</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormDescription>Number of prescription refills allowed</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Issuing..." : "Issue Prescription"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PrescriptionForm;

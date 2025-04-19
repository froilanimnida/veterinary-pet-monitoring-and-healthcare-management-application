"use client";
import { useState } from "react";
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
    Popover,
    PopoverContent,
    PopoverTrigger,
    Calendar,
} from "@/components/ui";
import { createVaccination } from "@/actions";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PetVaccinationSchema, type PetVaccinationType } from "@/schemas";

interface VaccinationFormProps {
    petUuid: string;
    petId: number;
    appointmentId?: number;
    appointmentUuid?: string;
    isUserView?: boolean; // Flag to determine if it's user view (for historical data) or vet view
}

export function VaccinationForm({
    petUuid,
    petId,
    appointmentId,
    appointmentUuid,
    isUserView = false,
}: VaccinationFormProps) {
    const [isSubmitting, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(PetVaccinationSchema),
        defaultValues: {
            external_provider: "",
            vaccine_name: "",
            administered_date: new Date(),
            batch_number: "",
            pet_uuid: petUuid,
            pet_id: petId,
            appointment_id: appointmentId,
            appointment_uuid: appointmentUuid,
            next_due_date: undefined,
        },
    });

    async function onSubmit(data: PetVaccinationType) {
        setIsLoading(true);
        toast.loading("Recording vaccination...");
        const result = await createVaccination(data);
        if (result === undefined) {
            toast.success("Vaccination recorded successfully");
            form.reset({
                ...form.getValues(),
                vaccine_name: "",
                administered_date: new Date(),
                batch_number: "",
                next_due_date: undefined,
            });
            setIsLoading(false);
            return;
        }
        if (result && !result.success && result.error) {
            toast.dismiss();
            toast.error(result.error || "An error occurred while recording vaccination");
            setIsLoading(false);
            return;
        }
        toast.dismiss();
        toast.error("An error occurred while recording vaccination");
        setIsLoading(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="vaccine_name"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Vaccine Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter vaccine name" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormDescription>The name of the vaccine administered</FormDescription>
                            <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="administered_date"
                        render={({ field, fieldState }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date Administered</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                                disabled={isSubmitting}
                                                type="button"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={isUserView ? undefined : (date) => date > new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>
                                    {isUserView
                                        ? "When this vaccination was administered"
                                        : "The date this vaccination is being administered"}
                                </FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="batch_number"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Batch Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter batch number" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormDescription>Optional batch/lot number</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="next_due_date"
                    render={({ field, fieldState }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Next Due Date (Optional)</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground",
                                            )}
                                            disabled={isSubmitting}
                                            type="button"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Select next due date</span>
                                            )}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date <= new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>When the next vaccination is due</FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <Button
                    onClick={() => {
                        console.log(form.formState.errors);
                    }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                >
                    {isSubmitting ? "Recording..." : isUserView ? "Add Vaccination Record" : "Record Vaccination"}
                </Button>
            </form>
        </Form>
    );
}

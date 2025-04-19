"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    FormItem,
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
    FormDescription,
    Input,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
    Calendar,
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui";
import { addHealthcareProcedure } from "@/actions";
import { type ProcedureType, ProcedureSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { toTitleCase } from "@/lib";
import { procedure_type } from "@prisma/client";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib";

interface PetProcedureFormProps {
    petUuid?: string;
    petId: number;
    appointmentId?: number;
    appointmentUuid?: string;
    isUserView?: boolean; // Flag to determine if it's user historical entry or vet current entry
    vetId?: number; // Optional vet ID for when a vet is performing the procedure
}

const PetProcedureForm = ({
    petUuid,
    petId,
    appointmentId,
    appointmentUuid,
    isUserView = false,
    vetId,
}: PetProcedureFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const petProcedureForm = useForm({
        resolver: zodResolver(ProcedureSchema),
        reValidateMode: "onChange",
        shouldFocusError: true,
        progressive: true,
        defaultValues: {
            pet_uuid: petUuid,
            pet_id: petId,
            appointment_id: appointmentId,
            appointment_uuid: appointmentUuid,
            administered_by: vetId,
            external_provider: "",
            procedure_type: procedure_type.deworming,
            procedure_date: new Date(),
            next_due_date: undefined,
            product_used: "",
            dosage: "",
            notes: "",
        },
    });

    const onSubmit = async (values: ProcedureType) => {
        setIsLoading(true);
        toast.loading("Saving healthcare procedure...");
        const result = await addHealthcareProcedure(values);
        if (result === undefined) {
            toast.dismiss();
            toast.success("Healthcare procedure added successfully");
            setIsLoading(false);
            petProcedureForm.reset({
                ...petProcedureForm.getValues(),
                procedure_type: procedure_type.deworming,
                procedure_date: new Date(),
                next_due_date: undefined,
                product_used: "",
                dosage: "",
                notes: "",
            });
            return;
        }
        if (result && !result.success && result.error) {
            toast.dismiss();
            toast.error(result.error || "Failed to add healthcare procedure");
            setIsLoading(false);
            return;
        }
        toast.dismiss();
        toast.error("Failed to add healthcare procedure");
        setIsLoading(false);
    };

    return (
        <Form {...petProcedureForm}>
            <form onSubmit={petProcedureForm.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col gap-6">
                    <FormField
                        control={petProcedureForm.control}
                        name="procedure_type"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>Procedure Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select procedure type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(procedure_type).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {toTitleCase(type)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>The type of healthcare procedure performed</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={petProcedureForm.control}
                        name="procedure_date"
                        render={({ field, fieldState }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Procedure Date</FormLabel>
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
                                        ? "When this procedure was performed"
                                        : "The date this procedure is being performed"}
                                </FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={petProcedureForm.control}
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
                                                disabled={isLoading}
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
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>When this procedure needs to be performed again</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={petProcedureForm.control}
                            name="product_used"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Product Used</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter product name" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormDescription>The name of the medication or product used</FormDescription>
                                    <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={petProcedureForm.control}
                            name="dosage"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Dosage</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 10mg/kg" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormDescription>The dosage of the medication or product</FormDescription>
                                    <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    </div>

                    {isUserView && (
                        <FormField
                            control={petProcedureForm.control}
                            name="external_provider"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Provider (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Who performed this procedure?"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Name of veterinarian or clinic that performed this procedure
                                    </FormDescription>
                                    <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <FormField
                    control={petProcedureForm.control}
                    name="notes"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Additional notes about the procedure"
                                    className="min-h-[120px]"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormDescription>
                                Any additional information about the procedure or observations
                            </FormDescription>
                            <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : isUserView ? "Add Procedure Record" : "Record Procedure"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PetProcedureForm;

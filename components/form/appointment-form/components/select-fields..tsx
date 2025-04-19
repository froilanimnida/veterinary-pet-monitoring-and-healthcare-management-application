import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import type { SelectFormField } from "@/types/forms/select-form-field";
import type { Control } from "react-hook-form";
import type { AppointmentControlSchema } from "../form-control-type";

interface SelectFieldsProps {
    fields: SelectFormField[];
    control: Control<AppointmentControlSchema>;
    selectedClinicId: string;
    isLoadingVets: boolean;
}

export function SelectFields({ fields, control, selectedClinicId, isLoadingVets }: SelectFieldsProps) {
    return (
        <>
            {fields.map((field) => (
                <FormField
                    key={field.name}
                    control={control}
                    name={
                        field.name as
                            | "pet_uuid"
                            | "vet_id"
                            | "clinic_id"
                            | "appointment_date"
                            | "appointment_type"
                            | "notes"
                            | "appointment_time"
                            | "duration_minutes"
                    }
                    render={({ field: formField, fieldState }) => {
                        const isVetField = field.name === "vet_id";
                        const isDisabled = isVetField && (!selectedClinicId || isLoadingVets);

                        return (
                            <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <Select
                                    required={field.required}
                                    onValueChange={(value) => {
                                        formField.onChange(Number(value));
                                        if (field.onChange) field.onChange(value);
                                    }}
                                    value={String(formField.value)}
                                    defaultValue={String(formField.value) || String(field.defaultValue)}
                                    disabled={isDisabled}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    isLoadingVets && isVetField
                                                        ? "Loading veterinarians..."
                                                        : formField.value?.toLocaleString() || "Select an option"
                                                }
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {field.options.length === 0 && isVetField ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">
                                                {!selectedClinicId
                                                    ? "Please select a clinic first"
                                                    : isLoadingVets
                                                      ? "Loading veterinarians..."
                                                      : "No veterinarians found for this clinic"}
                                            </div>
                                        ) : (
                                            field.options.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormDescription>{field.description}</FormDescription>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        );
                    }}
                />
            ))}
        </>
    );
}

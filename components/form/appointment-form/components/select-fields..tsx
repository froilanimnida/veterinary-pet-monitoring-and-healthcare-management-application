import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SelectFormField } from "@/types/forms/select-form-field";

interface SelectFieldsProps {
    fields: SelectFormField[];
    control: any;
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
                    name={field.name}
                    render={({ field: formField, fieldState }) => {
                        const isVetField = field.name === "vet_id";
                        const isDisabled = isVetField && (!selectedClinicId || isLoadingVets);

                        return (
                            <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <Select
                                    required={field.required}
                                    onValueChange={(value) => {
                                        formField.onChange(value);
                                        if (field.onChange) field.onChange(value);
                                    }}
                                    value={formField.value}
                                    defaultValue={formField.value || field.defaultValue}
                                    disabled={isDisabled}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    isLoadingVets && isVetField
                                                        ? "Loading veterinarians..."
                                                        : formField.value || "Select an option"
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

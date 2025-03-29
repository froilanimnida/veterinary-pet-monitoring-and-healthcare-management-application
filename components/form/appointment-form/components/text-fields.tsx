import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { TextFormField } from "@/types/forms/text-form-field";

interface TextFieldsProps {
    fields: TextFormField[];
    control: any;
}

export function TextFields({ fields, control }: TextFieldsProps) {
    return (
        <>
            {fields.map((field) => (
                <FormField
                    key={field.name}
                    control={control}
                    name={field.name}
                    render={({ field: formField, fieldState }) => (
                        <FormItem>
                            <FormLabel>{field.label}</FormLabel>
                            <FormControl>
                                <Input
                                    {...formField}
                                    required={field.required}
                                    type="text"
                                    placeholder={field.placeholder}
                                />
                            </FormControl>
                            <FormDescription>{field.description}</FormDescription>
                            <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
            ))}
        </>
    );
}

"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { VeterinarianSchema } from "@/schemas/veterinarian-definition";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectValue,
    SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormControl, Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { veterinary_specialization } from "@prisma/client";
import type { TextFormField } from "@/types/forms/text-form-field";
import { toTitleCase } from "@/lib/functions/text/title-case";
import toast from "react-hot-toast";
import { newVeterinarian } from "@/actions/veterinary";

const NewVeterinaryForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const newVetFields: TextFormField[] = [
        {
            label: "First Name",
            placeholder: "First Name",
            name: "first_name",
            description: "The first name of the veterinarian.",
            required: true,
            type: "text",
        },
        {
            label: "Last Name",
            placeholder: "Last Name",
            name: "last_name",
            description: "The last name of the veterinarian.",
            required: true,
            type: "text",
        },
        {
            label: "Email",
            placeholder: "Email",
            name: "email",
            description: "The email of the veterinarian.",
            required: true,
            type: "email",
        },
        {
            label: "Phone Number",
            placeholder: "Phone Number",
            name: "phone_number",
            description: "The phone number of the veterinarian.",
            required: true,
            type: "tel",
        },
        {
            label: "Password",
            placeholder: "Password",
            name: "password",
            description: "The password of the veterinarian.",
            required: true,
            type: "password",
        },
        {
            label: "Confirm Password",
            placeholder: "Confirm Password",
            name: "confirm_password",
            description: "Confirm the password of the veterinarian.",
            required: true,
            type: "password",
        },
        {
            label: "License Number",
            placeholder: "License Number",
            name: "license_number",
            description: "The license number of the veterinarian.",
            required: true,
            type: "text",
        },
    ];
    const specializationOptions = Object.values(veterinary_specialization).map((specialization) => ({
        label: toTitleCase(specialization),
        value: specialization,
    }));
    const newVeterinaryForm = useForm({
        resolver: zodResolver(VeterinarianSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
        progressive: true,
        shouldFocusError: true,
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            password: "",
            confirm_password: "",
            license_number: "",
            specialization: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof VeterinarianSchema>) => {
        await toast
            .promise(newVeterinarian(values), {
                loading: "Creating a new veterinarian...",
                success: "Successfully created a new veterinarian",
                error: "Failed to create a new veterinarian",
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    return (
        <Form {...newVeterinaryForm}>
            <form onSubmit={newVeterinaryForm.handleSubmit(onSubmit)} className="space-y-8">
                {newVetFields.map((newVetField) => (
                    <FormField
                        control={newVeterinaryForm.control}
                        key={newVetField.name}
                        name={
                            newVetField.name as
                                | "first_name"
                                | "last_name"
                                | "email"
                                | "phone_number"
                                | "password"
                                | "confirm_password"
                                | "license_number"
                                | "specialization"
                        }
                        render={({ field, fieldState }) => {
                            return (
                                <FormItem>
                                    <FormLabel>{newVetField.label}</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            {...field}
                                            type={newVetField.type}
                                            required={newVetField.required}
                                            placeholder={newVetField.placeholder}
                                            name={newVetField.name}
                                        />
                                    </FormControl>
                                    <FormDescription>{newVetField.description}</FormDescription>
                                    <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                                </FormItem>
                            );
                        }}
                    />
                ))}
                <FormField
                    name="specialization"
                    render={({ field, fieldState }) => {
                        return (
                            <FormItem>
                                <FormLabel>Specialization</FormLabel>
                                <FormControl>
                                    <Select
                                        disabled={isLoading}
                                        defaultValue={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue>
                                                {toTitleCase(field.value) || "Select a specialization"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Specialization</SelectLabel>
                                                {specializationOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        );
                    }}
                />
                <Button disabled={isLoading} type="submit">
                    Submit
                </Button>
            </form>
        </Form>
    );
};

export default NewVeterinaryForm;
